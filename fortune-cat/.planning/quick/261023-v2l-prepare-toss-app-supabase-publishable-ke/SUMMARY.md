# Toss account security and release preparation

Local changes and build are ready for review. Production remains unchanged. Full reopening and purchase restoration are not complete.

## Changes

- Explicit personal Toss login protects deep-reading/newyear and library. Canonical `toss:<userKey>` replaces client anonymous claims in JSON, FormData and query parameters. Token storage is memory-only. Expiry and HTTP 401 require explicit login again, without automatic retries or login prompts from analytics.
- Shared browser API key references were removed. The new Supabase publishable key is included in `fortune-cat.ait`; known private server/provider credentials are absent from its decompressed entries.
- New deep-reading, tarot and amulet purchases are blocked before SDK checkout. Pending receipts are preserved. Existing authenticated balances and free reveals keep their existing server settlement. Anonymous balances/history are not automatically reassigned.
- Legacy image reading and amulet routes show maintenance notices and do not import their old generation/payment modules. These features are not restored.
- Backend rejects malformed provider identities. A separate Toss grant endpoint fails closed with 503. Existing verified BFF payment grants remain unchanged. Tarot purchase verification also fails closed because the API cannot establish the buyer.
- Existing owned web/Android tarot records remain accessible with freshly authenticated HMACs after the server key rotates. Wrong owners and unowned records remain protected.
- User changes in both tarotRuntime files were preserved. No deployment, upload, account configuration, key revocation, Git history rewriting or commit was performed.

## Validation

- Frontend: 79 Node tests passed. Old positive purchase tests were replaced by fail-closed tests because checkout is intentionally prohibited. Cancellation, canonical identities, revoked-token clearing, no anonymous fallback and saved-receipt retention are covered.
- Backend: 564 offline tests passed; 4 existing disposable-Postgres cache cases skipped in this invocation. Those DB cases had passed separately in the preceding remediation. No SQL changed in this slice.
- Browser with every external request stubbed: seven route smoke tests, chunk-load failure/recovery, explicit login gates, native-login rejection/retry UI, no protected requests before login, closed legacy routes. No uncaught page errors.
- Node 24.22.1, obtained from the official distribution and SHA-256 checked, built the AIT successfully. No paid model, payment, or production-service calls were made.
- Changed active source ESLint and both repository diff checks passed. Known actual credentials were compared in memory, without printing values, against artifact entries and changed files/logs.

## Platform blocker

The [official order-status contract](https://developers-apps-in-toss.toss.im/api/iap) accepts an order ID and returns app-scoped order status/SKU, with no authenticated buyer field or supported user header. [Toss support](https://techchat-apps-in-toss.toss.im/t/iap/5022/2) states that the buyer association API is unavailable. An arbitrary extra header is not proof. Do not enable settlement or checkout until a provider-verifiable buyer association or equivalent documented mechanism exists.

## Dependency findings, reviewed 2026-10-23

`npm audit` against the committed npm lock reports 20 findings: 2 critical, 13 high, 5 moderate. No dependency upgrades or forced fixes were applied in this authentication change. Follow up before production reopening; next review 2026-10-24.

- Critical `protobufjs`: reached through AIT packaging tools and unused Firebase Firestore packages. The application imports Firebase app/analytics, not Firestore. AIT packaging uses local project input. The reported code-generation/schema risks are not a demonstrated client request path, but need a maintained dependency update.
- Critical `websocket-driver`: Firebase Realtime Database/Faye dependency, not imported by this app's analytics-only Firebase usage. No server WebSocket endpoint is shipped in the static app. Update the dependency chain rather than assuming an audit finding proves incident exploitation.
- High gRPC findings: unused Firestore server dependencies. High brace-expansion/minimatch/flatted/js-yaml/nanoid/postcss/source-map-js/rollup findings: build/lint toolchain processing project-owned input. Do not serve development tooling publicly or process untrusted project files.
- High Vite findings affect development tooling; some are Windows-specific. Local checks bound the preview to loopback. The suggested Vite 8 upgrade is a major change and is deferred for a separate tested SDK/toolchain migration.
- React Router findings include SSR/server actions, redirects and route matching. This app is a static client with fixed destination routes, not an SSR/server-action host. A compatible patched router update and regression checks remain needed.

No finding has been shown to explain the original key incident. This triage is not a clean dependency audit or approval to reopen production.

## Deployment order and next manual action

1. Keep urgent maintenance and legacy Supabase keys active. Do not simply redeploy an old Git revision: security changes are still local/uncommitted.
2. Review/commit the relevant security changes while preserving unrelated work. Verify prepared SQL and production variables; deploy backend and authenticated BFF together. Do not restore old Origin/key bypasses to resolve compatibility.
3. Upload the new AIT as a test candidate and validate its QR flow on an actual Toss device, with new payments still blocked. A local browser cannot verify the native Toss login bridge. No real paid request is authorized by the offline tests.
4. Resolve dependency findings and the required product scope for disabled legacy features before any limited reopening. Full paid reopening additionally requires the Toss buyer-proof blocker resolved.
5. Complete other service/public-client key migrations before disabling the paired legacy Supabase keys. Android store approval alone does not update old installed versions.
