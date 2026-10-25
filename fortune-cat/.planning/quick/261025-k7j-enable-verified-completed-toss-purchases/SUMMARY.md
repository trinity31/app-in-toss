# Order-once Toss settlement, 2026-10-25

The user explicitly chose completed-order validation plus globally one grant per order, without buyer/login equality proof. This supersedes the earlier blanket purchase block and the buyer-proof release gate in the 2026-10-23 report. It does not prove the claimant is the actual purchaser: another authenticated account can first-claim an unspent order ID it obtains.

## Implemented behavior

- Keep personal Toss login, canonical UID, account/resource checks, admission limits, server-only credentials and model restrictions.
- The server checks the exact order ID, completed status (`PAYMENT_COMPLETED` or `PURCHASED`) and approved SKU using provider mTLS. It does not send an unsupported buyer header. Invalid/refunded/pending/unapproved orders never grant credit. API failure or missing configuration fails closed.
- Deep-reading clients send only orderId and transport-injected UID to `/payment/deep-reading/toss-grant`. SKU-to-product and credit counts come from the server, not client amount/product. Both server SKU lists are required and disjoint from one another and approved tarot SKUs.
- One shared primary key, `payment_histories.order_id`, settles deep reading, followup packs, Toss tarot, and existing verified web/Android BFF grants. The same account/product retry returns current quota without adding credit. Another account, product or refunded ledger state conflicts. A transaction failure rolls back both order reservation and credit.
- Legacy tarot purchases missing a history row are backfilled as already settled without reissuing or restoring credit. Historical owner/product conflicts abort the migration for review. Unknown price is NULL rather than an invented or client-asserted paid amount. Existing amounts remain intact; unknown new Toss revenue needs provider-console reconciliation.
- Anonymous/public roles cannot write the ledger/quota tables or execute grant RPCs. Service-role access is retained. Existing web account deletion uses an admin client and remains authorized.
- The client saves receipts before SDK acknowledgement, settles after SDK success, and recovers saved or pending orders before opening another checkout. Failed verification/grant/completion keeps the receipt. Response quota is validated; missing/old RPC confirmation is an error rather than successful delivery. Recovery for another thread or a followup pack cannot automatically spend a reading credit.
- Recovery and checkout retain distinct result types across overlapping requests/remounts. Known same-operation duplicates share a single in-flight action.
- Legacy image reading and amulet stay in maintenance; this change restores the supported deep-reading and tarot purchase paths only.

## Verification

- Backend: 587 offline tests passed, including real disposable-PostgreSQL concurrency, cross-account/product retries, legacy backfill/rerun, privileges and transactional rollback. Four existing cache cases needing separate DB configuration were skipped; they passed in the earlier separate DB run.
- Client: 105 tests passed, including both recovery/checkout overlap directions, cancellation, storage failure, duplicate events, grant failure/conflict, app restart, completion false and already-settled retry. Changed active files pass ESLint; both repository diff checks and Python compilation pass.
- Node 24 AIT build passed. Artifact inspection found the new public Supabase key and no known private server/provider credentials or old common-key reference.
- Mocked browser route, login-gate and chunk-failure recovery checks use no external services. No paid/provider/production requests, deployment, operational SQL, console changes, key changes or commits were performed.
- Independent code review found the mixed-operation promise result issue; failing regressions reproduced it, and the fix passes. Accepted first-claim risk is unchanged.

## Required manual application order

1. Keep maintenance active. In Supabase SQL Editor, review and apply backend `docs/purchase_grant_once.sql` after existing followup/tarot payment migrations. It replaces grant functions, backfills historical ledger entries and changes privileges; it does not delete payment data or modify existing credit balances. If historical records conflict, the whole migration rolls back. Do not rerun older grant migrations afterward, as they replace these protections.
2. Configure backend Railway `TOSS_DEEP_READING_SKUS` and `TOSS_FOLLOWUP_PACK_SKUS`, comma-separated actual approved console SKUs, including any valid promotional SKU. Matching primary public SKUs were prepared in the ignored local backend `.env` from the Toss client's existing public settings. No server console variables were changed.
3. Review/commit only intended source changes, preserving unrelated work. Deploy the reviewed backend/BFF and new AIT together. Redeploying an old Git revision cannot apply these still-local changes. The default production environment does not read local `.env`.
4. Perform native Toss QR validation before reopening; live payment/model checks require separate authorization. Existing dependency audit findings (20, including 2 critical and 13 high) remain documented in the preceding task and need follow-up before production reopening. Full incident/key migration work is not complete.

Source contract: https://developers-apps-in-toss.toss.im/api/iap
