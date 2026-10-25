---
phase: quick
plan: 261025-tcr
type: execute
autonomous: true
---

# Reconnect every returning Toss customer's own legacy data

## Goal and constraints

Every returning customer sees their own old readings, conversation threads, purchase history and remaining credits after verified login. No individual SQL, order-number ownership claim, shared history or trust in client-supplied anonymous IDs. Production writes, provider/payment/LLM calls, pushes and deployments remain excluded. Preserve unrelated backend DB/script changes and frontend tarotRuntime files.

The existing one-account `legacy_reading_account_restore.sql` approach is superseded. Remove or clearly retire our helper/tests/docs in a normal follow-up change, preserving Git history. No personalized recovery SQL is part of this solution.

## Contract

- Extend `POST /toss-login` with optional `anonymousAuthCode`; existing clients omitting it retain their current login contract. The new client always supplies a fresh code and publishes its memory-only session only after `legacyLinked: true`.
- Obtain native proof using SDK 3.7 `User.createAnonymousKeyAuthCode()`. Codes expire after 300 seconds and are single-use. The backend exchanges `{code}` through the same miniapp mTLS certificate at `/api-partner/v1/apps-in-toss/users/anon-key/exchange`, accepting only a strict `SUCCESS` / `success.anonKey` response. It independently verifies login and derives canonical `toss:<userKey>` and legacy anonymous owner exclusively from provider results.
- Never use a raw anonymous key or its `/verify` API as proof of requester ownership. No new shared frontend secret, persisted bearer, anonymous authentication or weaker resource ownership checks.
- Invalid proof returns 401; an already-linked different account returns 409; unavailable provider/database/migration returns 503. HTTP-200 provider `FAIL` is failure. Bound provider exchange to 15 seconds, no automatic replay retries. Do not log raw identities, proof codes, tokens, orders, content or provider payloads.

## Task 1: Atomic backend link and migration

Add a service-role-only PostgreSQL link RPC and persistent one-to-one legacy/canonical mapping. Validate identifiers and strict RPC response. Serialize concurrent attempts across instances, including conflicts against ordinary quota/purchase mutations; avoid merely locking one process. A retry must return an acknowledged existing link without adding credits twice. SQL failure rolls back mapping and every ownership/balance mutation together.

Move all legacy `deep_reading_caches` ownership while retaining thread IDs, conversation content, revealed flags and target rows. Migrate `payment_histories`, `tarot_purchases.owner_uid` and `tarot_sessions.state.owner_uid` consistently. Sum remaining reading/followup/tarot balances and purchase counts, zero transferred source balances, retain latest purchase timestamp and use the maximum consumed-free counters. Preserve both existing free Tarot sessions and their access if source and target each have one; choose a deterministic quota marker without granting a new free trial or discarding history. Inventory additional owner-bearing stores before implementation. Unsupported/inconsistent state must fail atomically and explicitly, never silently lose a product.

The mapping must prevent a source being claimed by another target, a target accepting a conflicting source and stale legacy writers recreating spendable credits or losing rows after migration. Keep authenticated request identity and distributed admission/rate ownership canonical; do not change paid-model or global order-once controls. Document handling for already in-flight old-client requests and upgrade races.

Verification: mocked mTLS success, expired/replayed/malformed/FAIL codes, missing migration, forged raw owner, mismatched account, strict response and exception sanitization. Real disposable PostgreSQL tests cover same-account idempotence, cross-account simultaneous claims, two-instance races with purchase/quota operations, rollback, empty accounts, mixed new/old data, every product owner reference, both Tarot trial markers and revoked public/anonymous/authenticated RPC/table access.

## Task 2: Attach proof during explicit and automatic login

Extend `tossAccount.js` injectable dependencies and `tossSession.js` SDK wiring to obtain a fresh native anonymous authentication code for every login exchange. Validate the native shape; send only the code, never cached/raw anonymous ID. Require the new server acknowledgment before notifying subscribers or loading history/quotas. Fresh retry obtains both fresh proofs after consumption or network/database failure.

Preserve current native integration check, automatic login, 401 loop prevention, expiry/generation guards, single-flight behavior, 15-second bounds, centered 18px spinner and simplified login copy. On SDK/proof/server-link failure show a retryable gate rather than an apparently valid empty library or reset allowance. Existing cached anonymous analytics/storage identifiers do not authenticate migration.

Verification: explicit and automatic restored login both include proof; no proof or missing/false acknowledgment cannot publish a session or fetch history; stale completions after clear cannot restore another account; StrictMode/concurrent callers do one exchange; code failure/retry, network timeout and older unsupported native SDK fail safely. Existing payment recovery and canonical transport tests remain passing.

## Task 3: Integration review and reviewable release artifacts

Run offline backend/frontend regression suites and disposable PostgreSQL concurrency tests. Exercise a mocked returning customer with old readings/credits and new canonical history through login, combined library, owned reading access and quota display; another customer cannot access or claim them. Assert no duplicate free grant or paid credit, unchanged model/cost/admission controls and no secret/PII in modified files, test output, logs or bundle. Run the existing mobile Chromium/WebKit gate checks and build a new AIT without real services.

Record exact validation, known limitations and SQL deployment prerequisite. Deployment order for the user is new SQL, backend, then new AIT. New clients require the linking backend; old clients remain authenticated as before but cannot receive this fix without upgrading. All customers link on their own provider-verified login, never bulk ownership assignment. Prepare scoped normal local commits and the ignored AIT artifact if authorized by the established workflow; do not push/deploy or execute SQL against production.

## Sources

- https://developers-apps-in-toss.toss.im/guide/authentication/anonymous-key-auth-code
- https://developers-apps-in-toss.toss.im/api/user-key
- Installed SDK 3.7 declaration: exchanged `anonKey` equals the legacy `getAnonymousKey()` hash. Official rendered references were saved to `/tmp/toss-anonymous-auth-code-official.txt` and `/tmp/toss-anon-exchange-official.txt` during investigation.
