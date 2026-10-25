# Verified completed Toss purchases

User accepts order-ID first-claim risk without buyer/login matching. Require individual authentication, provider-completed state, approved server SKU and globally atomic one-time order settlement. Never claim this proves the actual buyer.

1. Backend active: offline failing tests; restore mTLS order/SKU validation; new Toss grant derives product and unknown amount server-side; transactionally unify deep-reading/tarot/BFF/Play/web grants via payment_histories primary key; legacy backfill with no credit and fail-closed conflicts; isolated PostgreSQL concurrency/rollback tests.
2. Frontend implemented, awaiting root review: restore checkout using grant callback, complete only after settlement, authenticated pending recovery; no common browser secret.
3. Verification pending: offline tests, build, artifact secret checks, review and migration/config instructions. No deployment, production SQL, real payments/models, revocation or commits.

Frontend finished checkout/recovery integration with personal Toss token transport, canonical UID injection, no browser shared secret, durable pre-ack receipts, recovery-before-checkout and server-confirmed quota display. New checkout restored for the two configured deep-reading products and tarot; legacy image/amulet remain closed. No buyer ownership proof is asserted. Node mock scripts 103 passed and touched active files ESLint clean; root owns release build and final review.


Root completion: frontend checkout/recovery restored and reviewed; 587 backend / 105 client tests, actual local PostgreSQL once-only races and rollback, mocked browser checks, Node24 AIT build, artifact/private credential checks passed. Operational SQL/configuration/deployment/native verification remain manual. No commits or deployments. See SUMMARY.md.
