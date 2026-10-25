# Verified returning-user login restoration

## Implemented

- Added shared `account.restore()` for protected gates. A bounded native integration check must return exactly `true` before the existing SDK authorization-code login and server exchange run. Native state never establishes identity.
- Retained memory-only access tokens, server-derived `toss:<userKey>` identity, 3600-second lifetime cap and 60-second expiry margin. Missing/malformed identity and already-buffer-expired credentials reject the exchange.
- Native checks time out after 3 seconds; SDK login, exchange response and JSON decoding each time out after 15 seconds. Automatic restore failure stops for the current cycle; manual retry remains available. A successful session permits a new automatic restore cycle after expiry.
- Shared in-flight work survives StrictMode remounts and concurrent gates. Session success publishes to subscribers. Clearing a session invalidates older native/SDK/exchange results and prevents a stale authorization code from starting an exchange. HTTP 401 suppresses automatic retries; manual login can establish a new session without stale work overwriting it.
- Gate subscribes and immediately adopts the latest session, checks current expiry before rendering protected children, schedules expiry recovery, guards component updates after unmount and hides the login form during initial restore.
- Exact title is `로그인하고 풀이 받기`; removed the entire previous-history block and its unused CSS. Kept the description, safe-area/bottom-navigation spacing, live status, alert and explicit manual login action.

## Validation performed by executor

- TDD first run: `scripts/tossAccount.test.mjs`: 12 passed, 20 failed before the restore/strict identity implementation. Original successful fixtures were updated with dummy server userKey values.
- After implementation: focused account/transport/Tarot tests initially 69/69 passed; later added hung SDK/exchange/body, pending SDK invalidation and actual HTTP 401 integration regressions.
- Final `node --test scripts/*.test.mjs`: **130 passed, 0 failed, 0 skipped**. This includes the pre-existing unrelated Tarot runtime WIP tests in the working tree; root will recheck an isolated release snapshot.
- `npx eslint src/lib/tossAccount.js src/lib/tossSession.js src/components/TossAccountGate.jsx`: passed.
- Mocked account coverage: linked/unlinked/unknown/unsupported native integration, native rejection/timeout, shared restore, server identity validation, expiry refresh, SDK/exchange/body timeouts, restore failure/manual retry, clear during native/SDK/exchange, new instance without persisted credentials, successful publication and HTTP401 loop suppression.
- No persistent token writes added. All requests used offline mock functions and dummy credentials. No native SDK, paid API, production or payment calls ran.

## Root follow-up

Root owns independent mocked rendered browser verification (including StrictMode, phone widths, expiry/unmount), isolated release validation and AIT build. Executor made no commits, pushes, deployments or builds. Native SDK behavior on an actual linked Toss installation remains a manual post-upload check.

## Files changed

`src/lib/tossAccount.js`, `src/lib/tossSession.js`, `src/components/TossAccountGate.jsx`, `src/components/TossAccountGate.module.css`, `scripts/tossAccount.test.mjs`, `scripts/deepReadingAuth.test.mjs`, `scripts/tarotConsultation.test.mjs` (dummy identity fixture only), this summary. Existing `src/lib/tarotRuntime.js`, `scripts/tarotRuntime.test.mjs`, sibling files and documents were preserved.

## Root verification

- Clean release snapshot excluded unrelated Tarot runtime WIP; all 130 offline tests passed with dummy credentials and mocked functions.
- Actual gate and account controller rendered under React StrictMode in Chromium and WebKit. 22 viewport/navigation combinations passed returning-user auto restore, first-visit manual login, exchange failure/manual retry,401 suppression, and expiry auto restore. Widths320/390/768/1440; short320px viewport at200% text. No horizontal overflow, history notice absent, exact heading verified. For short enlarged-text library layouts, scrolling to the page end places the CTA above floating navigation. All browser requests restricted to loopback.
- Native API's true integration result only triggers the existing provider-code/server exchange. A native status flag does not authenticate a user; backend still verifies tokens and ownership on every protected call. No bearer or refresh token persistence introduced.
- Current installed SDK3.7 declarations document `TossAuth.isIntegrated`; legacy alias is a compatibility fallback. The native device flow after upload remains unverified locally.
- No production calls, paid API calls, deployment, publication or push performed.

- Node24 production AIT build passed; existing large chunk warnings remain. Clean artifact copied to `fortune-cat.ait`. Credential scan of changed files, dist and unpacked artifact found no known local private values. Local commit only.
