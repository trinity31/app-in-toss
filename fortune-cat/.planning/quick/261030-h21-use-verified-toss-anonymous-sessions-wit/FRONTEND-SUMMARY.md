# Frontend executor summary

Implemented locally, uncommitted and unstaged. No push, deployment, upload, production SQL/write, real Toss/provider/AI/payment request or key change. Canonical `fortune-cat.ait` remains unchanged, SHA256 **a23d595078a534c17f1e58336ef67ae77dae3b4477ebbc1e61a82dadfa37aa69**.

## Behavior

Normal native startup now calls **User.createAnonymousKeyAuthCode only** and `POST /toss-anonymous-session {code}`. It never calls OAuth appLogin, integration status, login-me or raw anonymous verification. Response must contain bounded token, valid unchanged legacy or `toss:` owner and expiresIn exactly900. Memory-only token refreshes at840seconds. Native/exchange/body/marker operations are bounded15seconds each. Single-flight, generation invalidation, explicit retry after401 and stale401 token guard preserved. First entry retains approved service introduction/Start; completed intro marker alone triggers fresh server authentication on reload, never authorizes children/resources. LocalStorage holds only this nonsecret presentation marker, no bearer credentials.

One singleton supplies reading requests and advanced Tarot consultation/history/detail/payment/recovery. Tarot runtime of a different origin is rejected before proof/headers; resource transports strip old OAuth, API key, Authorization and raw Tarot UID headers, set only new anonymous header, forbid redirects and omit cookies. Existing Tarot capability/deck headers remain. Owned reading requests always overwrite attacker-supplied owner in query/JSON/FormData.

Optional library action **이전 토스 로그인 계정의 기록 연결** supports OAuth-only old customers not yet mapped to native anonKey. Only explicit button+confirmation calls old `/toss-login` with fresh proof and strict legacyLinked true; then another fresh native proof establishes anonymous session under existing canonical owner. Library and Tarot lists refresh for new mapped owner. No automatic OAuth, owner guessing or free reset. Previously mapped and old raw-UID customers access original records directly.

Copy describes anonymous startup; centered18px loader preserved. Removed raw anonymous identifier/native payload console output from old analytics hook; its cached raw ID remains analytics-only, never request authority. Legacy TossLogin component remains for disabled Amulet flow outside supported anonymous routes.

## Verification

- **172 Node tests passed**,0 failed/skipped, on Node24.22.1. Same172 tests pass in clean archive candidate with original user Tarot runtime WIP excluded. Baseline OAuth-oriented tests rewritten around new anonymous contract while preserving failure/timeout/single-flight/generation/ownership/payment assertions; new regression coverage added.
- Actual local fixture mobile **Chromium+WebKit,44 checks passed**: initial intro before proof, fresh native proof after full JS memory reload using presentation marker only, no OAuth, mapped/unmapped/new libraries/balances, explicit orphan recovery, old token401 after mapping, owner404, exhausted balance402, mock order replay, refresh, failure/provider/expired/unsupported, centered18px spinner,320px/768px/200%text. All browser requests restricted loopback, no page errors/external network. Initial final-run test synchronization race was fixed by waiting for refresh completion before clearing; final Node24 browser suite passes.
- Screenshots inspected: `/var/folders/0q/rrv0s8pn0d78fk2pt7fl2r400000gn/T/catbot-anonymous-browser-sbT9uq/` includes both engines first-entry/library/centered-loading.
- Clean isolated **Node24 Vite+AIT build passed**; existing >500kB chunk warning remains. Candidate `/var/folders/0q/rrv0s8pn0d78fk2pt7fl2r400000gn/T/catbot-anonymous-release-7ohje__9/fortune-cat`. Only public dummy Supabase build configuration, public backend URL. **This candidate is for build verification, not upload.** Canonical AIT untouched. User tarotRuntime.js/test WIP excluded, siblings untouched.
- Scoped ESLint0errors,1existing useAnonymousKey FastRefresh warning. git diff --check passed. Canonical owner-validation mutation was caught by tests and restored. Private local environment value scan of48modified/artifact/log files found0matches; no private values printed.

## Immediate manual review, no deployment

From `/Users/trinity/Projects/app-in-toss/fortune-cat`:

```
npm run test:anonymous-session:local
```

Open **http://127.0.0.1:5189**. Backend fixture binds127.0.0.1:8019; Ctrl-C stops. Launcher copies only actual tested controller/gate/transports and fixture UI into isolated temp Vite root, reads no project .env, imports no Firebase/Supabase/Sentry/ads; child backend strips real credentials and blocks nonloopback networking. No fixture code included in app bundle or production backend Docker. All sample records visibly MOCK. Customer/scenario selector, reset/first-intro controls, old/new/mapped/orphan libraries, quota, mocked reading/Tarot, mock payment replay and owner denial available. Exact prerequisites/steps: **scripts/anonymousSession.local.md**. Source marker fixture is per customer; real presentation marker is single nonsecret marker.

This verifies local behavior and real backend session signing/ownership checks with fake native provider/store/AI/payment adapters. It does not prove actual Toss native bridge/mTLS or production secret/RPC readiness. New backend secret+read-only SQL still NOT applied. User must manually review locally before later deployment. Preserve existing backend old OAuth compatibility for staged release. Later deployment order only after user approval: SQL resolver, backend-only secret/backend, then app. No such deployment performed.

## Exact task-owned paths

Modified:
- package.json
- src/lib/tossAccount.js
- src/lib/tossSession.js
- src/lib/deepReadingAuth.js
- src/lib/entryErrors.js
- src/lib/tarotConsultation.js
- src/lib/tarotLibrary.js
- src/hooks/useTarotConsultation.js
- src/hooks/useAnonymousKey.jsx
- src/components/TossAccountGate.jsx
- src/components/TarotLibrary.jsx
- src/components/TarotConsultation.jsx (comment only)
- src/pages/LibraryPage.jsx
- scripts/tossAccount.test.mjs
- scripts/deepReadingAuth.test.mjs
- scripts/purchaseSecurity.test.mjs
- scripts/tarotConsultation.test.mjs
- scripts/tarotLibrary.test.mjs
- scripts/tossAccountGate.browser.mjs

New:
- src/components/LegacyAccountRecovery.jsx
- src/components/LegacyAccountRecovery.module.css
- scripts/anonymousSession.local.mjs
- scripts/anonymousSession.local.md
- scripts/anonymous-preview/session.js
- scripts/anonymous-preview/fixture.jsx
- scripts/anonymous-preview/preview.css
- this FRONTEND-SUMMARY.md

**Do not stage user WIP src/lib/tarotRuntime.js or scripts/tarotRuntime.test.mjs, unrelated untracked branding docs, sibling apps or private .env.** package-lock unchanged because no dependencies added.

## Root review follow-up: owner transition races

Root identified stale asynchronous library updates during optional account recovery. Fixed both actual components:

- Reading library history effect now aborts obsolete fetches and ignores all superseded response/error/finally callbacks. Ownership subscription updates a synchronous owner ref before React state. Pending reading detail/delete responses cannot update selection/list/toast/deleting state after ownership changes or unmount. New owner's history resets selection/list/deletion state and starts independently.
- Tarot library now uses request generation and synchronous busy ref. A new owner always starts a new list request even if the previous owner is still loading. Old list/detail/error/finally callbacks cannot replace items/selection, expose an old error or clear newer loading. Unmount/owner cleanup invalidates generation; missing owner does not initiate authentication.
- New **scripts/libraryOwnership.browser.mjs** renders actual LibraryPage and TarotLibrary, delays old-owner responses deliberately and ignores AbortSignal to exercise generation protection. **14 checks passed on mobile Chromium + WebKit**: new owner load starts while old busy; old success cannot replace new list; old Tarot detail failure cannot set error/clear busy; old reading detail success cannot reopen selected; stale list errors/finally cannot clear new pending loading. No external requests, page errors or real services.
- Disabling Tarot owner/generation check made this actual-component test fail with stale owner rendered; restored guard. **172 Node tests still pass**, targeted modified-component ESLint0errors/warnings, diff check clean.
- Updated clean Node24 **Vite+AIT rebuild passed** in the same isolated candidate, original Tarot runtime WIP excluded. Canonical AIT remains unchanged. No commits, staging, deployment or production operations.

## User steering: actual app UI, no synthetic test-control screen

Added **npm run preview:local** (`scripts/actualApp.local.mjs`) at **http://127.0.0.1:5189**. It renders the actual unchanged main.jsx/App.jsx route entry and real HomePage, account intro, NewYearPage input/loading/result, LibraryPage and Tarot pages. It has no customer/scenario/debug selector UI, only a thin local/no-real-cost notice. Existing isolated launcher gained actualApp mode; original detailed fixture mode remains available separately.

Only native/external integration boundaries are replaced by local adapters in **scripts/app-preview/**: SDK proof uses loopback fake-provider code and actual server session endpoint; real production tossSession singleton and signed token/owner transport run unchanged. Local catalog uses existing menu codes/JOB_MENU plus offline descriptions; daily Tarot uses existing repository22-card SQL seed and original local card assets. Latest production catalog is not queried or claimed identical. Firebase/Sentry/ads/share/payment SDK are local no-network adapters. Frontend runs copied source in isolated temp root without .env; envPrefix blocks inherited VITE variables, CSP/fetch/XHR guard prevent external networking. Real customer data or provider calls are never used. Actual native bridge/mTLS still requires later device verification.

Actual UI inspection found and fixed two core bugs:
- deepReadingPurchase.account still rejected raw anonymous IDs with a toss:number-only regex. It now reuses canonical **validAccountId**, preserving durable same-owner receipt checks. Added raw and mapped opaque-owner purchase/recovery tests, including different-owner rejection before grant.
- DeepReadingResult purchase recovery effect skipped StrictMode replay while purchaseBusy was true, leaving isPurchasing stranded and reveal handler permanently blocked. Removed that early return: repeated effects observe the existing serialized/single-flight recover promise, with existing cancellation guards. Actual React StrictMode browser test first reproduced the blocked reveal and passed after this one-line correction.

Fixture-only backend additions in **scripts/anonymous_session_preview.py**: authenticated mock reveal/free-reveal with owner and credit/trial checks, chat with followup debit, delete-history owner check, safe track acknowledgment, and correct free daily-result flag. Production backend routes unchanged. Added **tests/test_anonymous_session_preview.py** regression for reveal idempotency/credits, cross-owner denial, chat debit and delete ownership. Targeted offline suite **6passed,712deselected**, existing5warnings.

Verification: **174 Node24 tests passed**, actual full-app mobile **24 checks passed across Chromium+WebKit**. Tested real home→intro before proof→native-only authenticated input→generation→credit reveal→chat→fresh-proof library reload→saved Tarot detail→Tarot landing/intro/new question/plan/draw/result. No OAuth endpoint, page errors or external browser requests. Screenshots: **/var/folders/0q/rrv0s8pn0d78fk2pt7fl2r400000gn/T/catbot-actual-app-wKilqb/**. Home and result inspected; result capture is during existing fade-in animation, actual reveal/chat functionality passed. Real UI has existing transitions and system font fallback offline.

Clean Node24 Vite+AIT build updated for both changed production files and passed, original unrelated Tarot runtime WIP excluded. Canonical AIT unchanged. No staging/commit/push/deploy/upload/production SQL or key changes. Actual-app test server stopped after automated checks; root can now start **npm run preview:local** and keep URL alive for user. Instructions **scripts/actualApp.local.md**.

Additional task-owned frontend paths: src/lib/deepReadingPurchase.js, src/components/DeepReadingResult.jsx, scripts/deepReadingPurchase.test.mjs, scripts/anonymousSession.local.mjs, scripts/actualApp.local.mjs, scripts/actualApp.local.md, scripts/actualApp.browser.mjs, scripts/app-preview/{bootstrap.js,guard.js,sdk.js,integrations.js,catalog.js,cards.js,tarot-cards.json}, package.json. Backend changes are fixture script/test only as listed above.

## User authorized real build for their own deployment

Supersedes the prior “do not replace canonical AIT before local review” boundary: user ended web review and explicitly chose Toss app build/deploy testing themselves. Fresh clean production build used actual allowlisted public frontend configuration, not dummy Supabase values or local adapters. Node24 Vite+AIT succeeded, official AIT reader20entries inspected, private/runtime scan0findings. Canonical AIT now SHA256 **b1558389cb74811f582328da5773b7c1d38564e4d3fec58fdb181bdf13367149**. Previous a23d595... artifact backed up outside Git under Downloads/catbot-release-backups. Exact paths, manifest, scan and deployment prerequisites: **RELEASE-HANDOFF.md**. No upload, production SQL/backend configuration/deploy, key change, commit or push executed. Backend resolver SQL+dedicated secret+backend deploy must precede app upload.

## User correction: recovery visibility

Library recovery now appears only for verified raw/unlinked owners after both reading and Tarot histories successfully complete empty. It is hidden for every canonical `toss:` owner, any reading/Tarot record, loading/error/malformed/unknown-pagination result. Owner-scoped Tarot status is reported through a stable parent setter using existing requests; no extra lists or effect loop. Parent invalidates summaries on actual owner changes but preserves same-owner session refresh. Guarded old responses cannot reveal the control for another owner. Existing orphan recovery still works and disappears after mapping.

Actual parent/child browser regression expanded to42passing checks in Chromium+WebKit, covering reading-only/Tarot-only/both/empty/mapped-empty/loading/error/malformed/owner changes/same-owner refresh/recovery success. Existing-record condition mutation was caught and restored. Node174passed, scoped ESLint0errors/warnings, diff check clean. Only production files LibraryPage.jsx and TarotLibrary.jsx changed for this correction; custom synthetic fixture mirrors visibility and actual-component browser tests updated. No backend/auth/data policy changes. Plan updated.

Real public production-config clean Node24 Vite+AIT rebuild passed with original Tarot runtime WIP excluded. Official AIT reader20entries, native auth/new visibility code present, no private values/mock runtime markers. Canonical artifact now SHA256 **8eefc1530e2d6db1a3a9c1098b3ac3d2e628a79f9e63dd613e94a9f2db3f6245**, bytes3662111. Previous **b1558389cb74811f582328da5773b7c1d38564e4d3fec58fdb181bdf13367149** safely backed up at **/Users/trinity/Downloads/catbot-release-backups/fortune-cat-before-anonymous-b1558389cb74.ait**. Latest manifest/verification saved outside Git. No upload/deploy/push/commit/production SQL/key operations. See RELEASE-HANDOFF.md for the latest artifact and manual existing-record check.

## User correction: recovery only after explicit help selection

Supersedes the prior raw-empty direct-action visibility: new customers must not see a legacy recovery button by default. Added LibraryRecoveryHelp.jsx/CSS, a native collapsed details/summary labelled “보관함 도움말”. Only an explicit user expansion mounts LegacyAccountRecovery; closing unmounts it. Parent keeps previous eligibility (both histories successfully empty, raw owner only), keys help by owner to reset on owner change, and preserves same-owner refresh state. Mapped/record-bearing/error/loading users have no recovery help. No new auth/backend/data changes or identity inference. Synthetic preview now mirrors this UI; fixture gate test explicitly opens help before optional recovery.

Actual parent/child browser suite46passed across Chromium+WebKit, including no default DOM/prompt, keyboard expansion, collapse/reset, zero recovery calls until final user action, successful mapping hides it, and all previous history/owner/error guards. Forcing help open by default made the regression fail; restored. Node174passed, scoped ESLint/diff clean. Production clean Node24 Vite+AIT build once with real allowlisted public config passed; official reader20entries and decoded runtime scan0private/MOCK findings, required native auth/new help code present. WIP preserved/excluded.

Canonical AIT updated to SHA256 **86a3b29f866792fbc7b4d9ed403608371d21f913f1f9331ac75f3e8cf6b4f476**, bytes3662294. Previous **8eefc1530e2d6db1a3a9c1098b3ac3d2e628a79f9e63dd613e94a9f2db3f6245** backed up at **/Users/trinity/Downloads/catbot-release-backups/fortune-cat-before-anonymous-8eefc1530e2d.ait**. Latest RELEASE-HANDOFF.md rewritten around final behavior and artifact. Manifest includes42taskfiles with new help component. No staging, commit, push, upload, deployment, paid API, production SQL/key/config operations. User next action is direct Toss upload/device check of no default recovery prompt and explicit help recovery.
