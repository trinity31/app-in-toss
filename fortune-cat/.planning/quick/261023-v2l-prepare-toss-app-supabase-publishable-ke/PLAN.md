# Toss security remediation

Scope: new public Supabase key, verified individual Toss identity for deep reading, server-verified purchases, no browser shared secret. Preserve existing work. No deployment, production calls, key revocation, or commits.

1. Backend (implemented and reviewed): offline regressions, strict identity, separate authenticated Toss grant, shared request limits. Verify current official purchase ownership contract before enabling grants; fail closed if unavailable. Prepare durable ownership/idempotency migration only where an authenticated buyer can be proved. Preserve existing web BFF behavior.
2. Frontend (implemented and reviewed): shared Toss account client, canonical identity for every deep reading request, login before generation, payment completion only after server grant, recover pending orders. Remove common credential from bundles; leave legacy generated-image and unverified amulet APIs unavailable.
3. Validation (local checks complete; native/production gates remain): mocked login/purchase/model tests, artifact secret checks, Node 24 build, report configuration and remaining platform constraints.

Discovered release gate: official API https://developers-apps-in-toss.toss.im/api/iap exposes no buyer identity or user header. Official support https://techchat-apps-in-toss.toss.im/t/iap/5022/2 confirms no buyer verification API (2026-10-19). Order validity alone is insufficient proof of account ownership.

Frontend security slice: explicit login gate on newyear/library, canonical personal Toss UID transport for start/quota/history/conversation/delete/reveal/chat, no shared API key in reachable client modules. Legacy saju/amulet routes unavailable. All new IAP purchases blocked before SDK because buyer ownership cannot be verified. Existing deep-reading credits/free reveals remain usable; saved pending receipts retained. Anonymous histories/balances are not migrated. No production calls, deployment, account configuration, or commits.
