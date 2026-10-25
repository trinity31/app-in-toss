# Frontend implementation complete

No commits, push, deploy, production write or provider/model/payment request performed.
Unrelated tarotRuntime source/test WIP and sibling untracked files preserved.

## Changes

- `src/lib/tossAccount.js`: every actual login obtains fresh SDK login and anonymous proof,
  validates code/expiry shape, sends anonymousAuthCode, and requires legacyLinked === true
  before memory session publication. Native proof is individually bounded to15seconds;
  clear/generation checks prevent late proof from authenticating another account. Missing,
  unsupported or rejected native feature is a sanitized retryable login failure. Cached valid
  sessions do not exchange again. No raw anonymous ID, persisted bearer or frontend secret.
- `src/lib/tossSession.js`: injects SDK3.7 User.createAnonymousKeyAuthCode. The factory has no
  optional unlinked-session mode. Only production caller uses this wrapper; test fixtures updated.
- `scripts/tossAccount.test.mjs`, `scripts/deepReadingAuth.test.mjs`,
  `scripts/tarotConsultation.test.mjs`: secure fixtures and proof/ack/transport regressions.
- No UI changes: approved centered spinner, title, automatic restore and401 loop suppression remain.

## Verification

TDD initially52tests /15expected failures for proof/ack regressions; implementation resolves them.
All frontend tests:149passed0failed, including explicit/automatic proof, single flight,
missing/false/string ack, no history or quota fetch before linking, fresh proofs after failure
and expiry, unsupported SDK, invalid proof, timeout and stale clear. Clean isolated release
snapshot excluding Tarot WIP also passes149 under Node24.22.1.

Chromium/WebKit browser mock:22 cases across320x568,390x844,768x1024,1440x900 and320x420,
with/without bottom navigation,200%text short viewport, StrictMode. Auto login, manual login,
expiry,401no-auto-loop, missing-ack retry and unsupported native SDK checked. Failed proof/ack
never mounts history. All browser network restricted to127.0.0.1. Harness initially lacked
app global box-sizing reset; adding actual index.css fixed harness-only horizontal overflow.
No production source/UI adjustment was needed.

Node24 clean isolated `npm run build`: successful Vite+AIT. No deployment. Artifact not yet
copied to canonical output, root should review/scan and copy:
`/var/folders/0q/rrv0s8pn0d78fk2pt7fl2r400000gn/T/catbot-customer-link-w8zzyqw9/release/fortune-cat/fortune-cat.ait`
Size3205004bytes;SHA25689ddc9c8c9780a7c5a0c69da15d8c84ebf1b843637c88530a8f7eb3e48c517d2.

Logs:/tmp/toss-link-frontend-tests-final.log,/tmp/toss-link-frontend-clean-tests.log,
/tmp/toss-link-browser.log,/tmp/toss-link-build.log. Browser harness in directory recorded by
/tmp/catbot-customer-link-path. Harness files removed before build. git diff --check clean.

## Release constraint

Apply new SQL then deploy backend before newAIT. NewAIT deliberately rejects old backend
responses lacking acknowledgment instead of showing empty history. Older native Toss apps
without anonymous-proof bridge fail safely and need updating; existing oldAIT retains prior
backend login compatibility until upgraded. Actual provider exchange and customer-library
restore need user verification after deployment. No claims of real service verification.
