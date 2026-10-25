# Verified per-customer legacy account linking

Implemented the plan. Every customer links only their own independently provider-verified
legacy anonymous account to canonical Toss identity on next login. No individual restoration
SQL, raw client owner proof, bulk assignment, shared frontend secret or weaker ownership.
Backend local commit: `231c9b7`. No push/deploy.
Backend and frontend details: BACKEND-SUMMARY.md and FRONTEND-SUMMARY.md.

## Verification and review

- Backend offline637 passed,4 existing optional tests skipped;24 disposable PostgreSQL
  tests included, covering same/different account races, all product ownership, balances,
  late old purchase rejection and rollback without reserving the order.
- Frontend149 passed; clean Node24 release snapshot excludes unrelated Tarot WIP.
- Chromium/WebKit22 loopback-only browser cases pass, including automatic and explicit
  login, unsupported native proof, missing acknowledgment, expiry and401 loop suppression.
- Root reviewed API contracts, transaction/lock order, permissions, stale writes, moving-date
  unique-index collisions and both Tarot trial markers. No unresolved blocking finding.
- Removing strict legacyLinked acknowledgment in a temporary release source makes its
  regression tests fail; restored source passes. Canonical implementation was not mutated.
-42 files/container members/logs scanned against42 available private environment values
  plus private-key patterns; no matches. Includes decompressed AIT members. This is scoped
  verification, not proof that all repository history or external systems are secret-free.
- Vite+AIT build succeeds. Canonical ignored fortune-cat.ait refreshed after review/scan.
  SHA256:89ddc9c8c9780a7c5a0c69da15d8c84ebf1b843637c88530a8f7eb3e48c517d2.
- Unrelated backend DB/script/docs changes and frontend tarotRuntime source/tests preserved.

## Rollout and remaining verification

User action order: apply docs/toss_legacy_account_link.sql in Supabase after already-applied
purchase_grant_once.sql, deploy backend, then upload new AIT. A reviewed identical SQL copy
is at ~/Downloads/catbot-toss-legacy-account-link.sql. SQL installs mapping/RPC/guards;
actual customer records transfer only at their successful verified login. No per-customer
SQL editing. Old individual Downloads helper was removed without execution.

Do not upload new AIT against the old backend: missing acknowledgment deliberately prevents
session publication. Old AIT login remains compatible but does not auto-link records.
Older native Toss app without proof support needs updating. A conflicting map requires
support review;10-second DB lock/deadlock failure requires fresh-proof retry. A committed
link with lost HTTP acknowledgment remains safe to retry. Table locks are short database
transactions; no provider/model call runs inside them.

Real provider proof exchange and restored customer library must be checked by the user
after deployment. No production write, provider/payment/paid-model request, key operation,
push or deployment was performed. Existing dependency/legacy-key followup remains separate.
