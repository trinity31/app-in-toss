# Backend implementation complete

No commits, push, deployments, production DB writes or real provider/payment/model calls.
All unrelated backend WIP (local DBs, scripts, README, .gitignore and untracked docs) preserved.

## Contract

`POST /toss-login` request adds optional `anonymousAuthCode` (1..2048 chars), rejects extra
raw identity fields, and response adds `legacyLinked:boolean`. Old clients omitting proof
retain login with false. New client must obtain fresh native code every attempt and require
true before exposing its session. OAuth login identity and native anonymous proof are
independently provider-verified. Token contents/session/rate/ownership code is unchanged.
Exchange uses the exact official app-scoped mTLS endpoint, timeout15, no provider retries.
The endpoint also applies 15-second outer bounds to native exchange and RPC acknowledgment.
No raw codes, identities or error payloads are logged or returned on failure.

Service-role RPC: `link_toss_legacy_account(p_legacy_uid,p_toss_uid)`.
Success: `{linked:true,already:boolean}`. Conflict: `{error:'account_conflict'}` -> HTTP409.
Invalid/replayed native proof -> HTTP401. Malformed result, missing migration, unavailable
provider/database -> HTTP503. No session response on failure. DB 10-second lock timeout
or deadlock rolls back; frontend obtains fresh proofs on retry. A committed link whose
HTTP acknowledgment was lost is safe to retry without duplicate credit.

## Data

New `docs/toss_legacy_account_link.sql` atomically transfers all cache owners (readings,
thread IDs, chat and reveal flags preserved), purchase-ledger ownership, Tarot purchase
ownership and Tarot session state owner. Existing target rows stay. Unspent reading,
followup, Tarot quota and purchase totals sum once; source spendable counters zero;
free-use counts use maximum; latest purchase timestamp retained. Both free Tarot sessions
remain accessible, with existing target marker preferred; otherwise source marker transfers.
No new ledger records, amounts/status changes or model calls.

Durable one-to-one mapping has RLS and no direct service/client table grants. Only service
role executes the link RPC. Triggers reject later source-owned insert/update on all five
stores. Exception rejection rolls back an old grant RPC including its order reservation.
Mapping inserts last after all transfer changes. Locks serialize across instances and
existing writers; no LLM work occurs in the transaction. Source quota free markers remain
historical, but stale writes cannot rebuild source credit.

Moving-date unique index and existing write RPC remain intact. If source/target have a
same-subject moving-date collision, revealed/paid row wins derived lookup key (then newest,
then thread ID). Redundant historical rows get `subject_key=NULL` only; both histories,
content, access, thread IDs remain present. Future creates still use unique-index dedup.
Analytics retains historical IDs and does not authorize any resources. SQLite checkpointer
threads keep their thread IDs; no separate paid-owner store was found outside listed tables.

Old generic administrator recovery SQL and its tests removed; prior instructions replaced
with explicit retirement notice. Root should retire the previous personalized Downloads SQL
and rewrite the incident report's old individual-recovery followup. Do not rewrite history.

## Verification

TDD red reproduced missing proof/RPC behavior and absent SQL; subsequent fixes pass.
`venv/bin/python scripts/test_offline.py`: **637 passed, 4 skipped**, 5 existing warnings.
New SQL file alone: **24 passed**, disposable local PostgreSQL, including concurrency,
one-to-one conflicts, target+source histories, all products, both free Tarot markers,
rollback, rerun, invalid balances, client permissions, and queued real grant_purchase RPC
that starts before link commit and is rejected without reserving its order afterward.
HTTP/native proof tests: strict success/FAIL/malformed/expired contracts, bounded mTLS
constructor, retry count, login+proof separation, sanitized timeout, no session on link
failure, missing migration acknowledgment and raw owner rejection. No external services.
`git diff --check`: clean. Full final log: `/tmp/toss-link-backend-suite-final.log`.

## Release prerequisite and limitations

Apply SQL after purchase_grant_once.sql, deploy backend, then new AIT. No individual SQL.
Do not rerun old quota/purchase migrations over security RPCs. Old clients can still login
but need new AIT to auto-link; unsupported native proof SDK must fail safely with retry.
Mapping conflicts require support review and cannot silently transfer another account.
A lock/deadlock failure may require a fresh-proof retry; this is fail-closed, not an empty
library success. Actual Toss proof exchange and real restored-customer UI still need user
verification after deployment, no paid model call is needed just to verify library.
