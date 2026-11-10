# Backend executor summary

Implemented backend-only, left uncommitted for root review. No staging, push, deployment, production DB/SQL, real Toss/LLM/payment calls or environment changes. Unrelated backend WIP retained. Backend baseline58ac2bb. Full offline suite **713 passed,4 skipped**; skips remain existing optional moving-date SQL setup. New local PostgreSQL resolver tests execute in the suite using disposable Unix-socket clusters, never environment Supabase.

## Frontend contract

- `POST /toss-anonymous-session` JSON **exactly `{code:string}`**, length1–2048, no extras/type coercion.
- Success **`{token:string,userId:string,expiresIn:900}`**, Cache-Control:no-store. Header **X-Toss-Anon-Token**, no `Bearer` prefix, no OAuth token.
- Owner remains the exact legacy anonKey (`[A-Za-z0-9_-]{1,200}`) when unlinked; existing mapped owner is `toss:[A-Za-z0-9_-]{1,128}`. Client must accept both response owner forms, not invent a prefix.
- 401 invalid/reused native proof, malformed/forged/expired token or changed mapping; 422 bad body; 503 missing secret/RPC/config/provider/DB. Existing resource/limit/payment errors remain.
- Anonymous token plus OAuth access token/BFF API key/Authorization/X-Tarot-User, even empty competing header, fails401. Duplicate/empty anonymous headers fail401. `X-Tarot-Token` capability is allowed and still needed for consultation routes/unowned sessions; history requires only verified account session.
- Every authenticated request re-resolves signed verified anonKey, so old token becomes401 after old OAuth client links account. Do not retry same proof or silently fall back to raw UID/OAuth. Existing OAuth/BFF routes unchanged; deep-reading Toss grant mode accepts verified OAuth or verified anonymous only.
- Native anonymous proof replaces neither consent nor legacy account recovery. Unmapped old canonical OAuth-only customers need optional explicit `/toss-login` with `anonymousAuthCode`; then obtain a fresh anonymous proof/session. Existing production OAuth/link endpoint unchanged.
- New secret **TOSS_ANON_SESSION_SECRET>=32characters**, backend-only, currently NOT configured. New read-only service-role resolver SQL **docs/toss_anonymous_session.sql**, currently NOT installed. Missing either failsclosed for new anonymous path; old OAuth/BFF works.
- No auth daily quota/table added. Body/code/time bounds and provider one-use/throttling remain; public endpoint flood protection is a documented edge/global-short-window follow-up, not claimed solved. Model work still has existing shared canonical account/global admission.

## Interactive fixture launch and exact API

From backend root:
`venv/bin/python scripts/anonymous_session_preview.py`

Binds **127.0.0.1:8019 only**, no reload. Clears inherited secrets, dotenv/tracing disabled, external connect/connect_ex/DNS blocked before app imports. Disposable local SQLite, mock providers/AI/payment/resolver, real session issuance/verification/SecurityMiddleware/owner checks/Tarot APIs and history router. No main.py import. Ctrl-C removes temp state. Server was started and actual HTTP smoke-tested, then stopped; port8019 is free.

Frontend fake SDK should call fresh helper every proof:
`POST http://127.0.0.1:8019/__preview/code`, JSON `{customer,scenario}`.
Returns `{code,expiresIn:300}`; one use only.

Customers:
- `legacy` -> `preview_legacy`, one mock old paid reading+one completed Tarot, reading2/followup13/purchased8/usedReveal1/usedFollowup1/Tarot2.
- `mapped` -> canonical `toss:202`, same own fixture counts/balances.
- `new` -> `preview_new`, no old records/balances/free use; one actual mocked-Tarot free session can be consumed.
- `other` -> `preview_other`, its own1+1records, cannot access another owner.
- `orphan` -> `preview_orphan`, empty initial library, canonical `toss:303` seeded old1+1records and same balances but no mapping. Explicit recovery below makes them accessible.

`scenario`: `normal` (default), `proof-failure` -> exchange401, `provider-unavailable` ->503. Unknown customer/scenario rejected422.

Other **fixture-only** endpoints:
- `GET /__preview/state`: `{mock:true,customers,mappings,quotas,readings,calls,orders}`, no tokens/codes. Synthetic IDs and counters safe. For inspector, calls.model remains0 on read-only flows.
- `POST /__preview/reset`, no body: reset all records/orders/proofs/counters/mappings/faults. Frontend must clear its own memory session and presentation marker if first-entry demo desired.
- `POST /__preview/resolver`, JSON `{unavailable:true|false}`:503 for new and existing sessions while true.
- `POST /__preview/expired-token`, JSON `{customer}`: returns session-shaped synthetic **already-expired** token to inject into mocked account response/stale-request scenario.
- `GET /health`: `{status:"OK",mock:true}`.
- CORS accepts only loopback HTTP origins; Host and Origin guarded; no private credentials exposed.

Actual session endpoint plus resources:
- `/quota?user_anonymous_id=<session.userId>`.
- `/deep-reading/history?user_anonymous_id=...` -> `{items:[{thread_id,user_anonymous_id,reading_type,is_revealed,reading,created_at,title,summary,messages,follow_up_questions}]}`. Thread IDs preview-reading-1(legacy),-2(mapped),-3(other),-4(orphan canonical).
- `/deep-reading/conversation?user_anonymous_id=...&thread_id=...` -> `{thread_id,reading,messages,follow_up_questions,reading_type}`; real owner check returns404 for someone else's thread.
- `POST /deep-reading/start` JSON/form user_anonymous_id plus optional JSON `paid:true`, reading_type; mocked result `{thread_id,user_anonymous_id,reading_type,is_revealed,reading,messages,follow_up_questions,summary,is_preview}`. Paid true consumes reading balance or402. Other reading request fields accepted within actual middleware limits; no actual production graph/LLM. JSON is simplest.
- `POST /payment/deep-reading/toss-grant` exact production `{orderId,user_anonymous_id}`. Mock order ID must start `preview-order-`. Sameowner/product replay no extra grant; crossowner/product409.
- All `/tarot/sessions` production consultation/free/get/command/purchase routes and history/detail operate on actual TarotService with synthetic SQLite store/AI. Use own random64hex capability for newconsultation; history none. Legacy seed major deck so existing deck gating works; new full deck requires X-Tarot-Deck as usual. Seed IDs UUID integer101legacy,102mapped,103other,104orphancanonical. Reading content clearly [MOCK]. Tarot draw enforces stored free/paid credits even if client payment_enabled=true.

Explicit orphan recovery fake OAuth SDK:
- Provide `authorizationCode:"preview-oauth-orphan"`, `referrer:"DEFAULT"`, and fresh orphan `anonymousAuthCode` to **`POST /toss-login`**. Any other code/owner rejected.
- Response production-shaped `{userKey:303,accessToken:"preview-oauth-token",refreshToken:"preview-unused-refresh",expiresIn:3600,legacyLinked:true}`. These are visibly synthetic and used only in fixture script.
- Actual production recovery endpoint remains unchanged; fixture mocks proof validation/link merge. New anon proof resolves toss:303; old anonymous token401; old records/balances preserved with no extra grant.

Tests cover own/read-only library+quota/Tarot history/detail, other owner404, proof replay401, failed proof/provider/resolver/expired cases, reset, Host/Origin, input/model failure before mock model, actual payment once, crossproduct409, free trial reuse/paid draw denial, explicit recovery stale token transition. SQL resolver tests cover unlinked/new readonly snapshots, mapped snapshot, anon/authenticated denied, invalid IDs, concurrent link/resolution and old token invalidation, absenttable failure. Existing OAuth/BFF and full deck/model/order regressions remain passing.

## Changed paths

New:
- api/toss_anonymous.py
- services/toss_anonymous.py
- docs/toss_anonymous_session.sql
- docs/toss_anonymous_session.md
- scripts/anonymous_session_preview.py
- tests/test_toss_anonymous.py
- tests/test_toss_anonymous_sql.py
- tests/test_anonymous_session_preview.py

Modified:
- main.py (router+CORS only)
- services/security.py (anonymous mode, mixed credentials, Tarot/account path, paymentmode, single no-storeheader)
- api/toss_payments.py (mode)
- api/tarot.py (allnativeconsultationroutes+explicit verifiedToss policy)
- api/tarot_history.py (new header auth)
- services/tarot_service.py (explicitnative policy for raw owner, private state marker hidden from public response)
- tests/test_tarot_payment.py (missing either native credential now401 ratherthan former requiredOAuthheader422)

Detailed future deployment/rollback guide in docs/toss_anonymous_session.md. User immediate next action must be local frontend harness review, not SQL or deployment. No canonical production AIT replacement authorized before user's local review.
