---
phase: quick
plan: 261025-w0f
status: implemented-and-verified
---

# Service introduction before first-time Toss login

First-time, unlinked visitors now see the Boknyang cat illustration, a birth-information-based AI service explanation, reading/follow-up/library benefits and a single Start action. The nearby notice explicitly says Start continues through Toss login and some readings/additional use are paid. Login cancellation/network errors return to the same introduction with a retry alert. The page scrolls naturally, retaining library navigation clearance and safe areas.

Returning integrated visitors retain automatic fresh verified login, existing memory sessions remain immediate, and the centered 18px account-checking status/CSS spinner is preserved. No authentication, identity-linking, backend, SQL, permissions or persistence logic changed. Home remains outside the gate. Tarot already has a service introduction; its unrelated runtime and test changes were preserved and excluded from the build.

## Changed implementation and tests

- `src/components/TossAccountGate.jsx`
- `src/components/TossAccountGate.module.css`
- `scripts/securityRoutes.browser.test.cjs` (new CTA selector and real rendered introduction assertions)
- `scripts/tossAccountGate.browser.mjs` (new portable offline actual React gate + actual account-controller harness)

## Validation

- `node --test scripts/*.test.mjs`: **149 passed, 0 failed**, both canonical working directory and clean release snapshot.
- New browser harness: **48 checks passed**, Chromium and WebKit. Actual controller with mocked native SDK/proof/exchange, React StrictMode, external traffic blocked. Unlinked/unsupported/integration failure/timeout all make zero login/proof/exchange calls until Start. Also verifies repeated taps single-flight, native returning and memory sessions, invalid/missing legacyLinked fail closed, cancellation/network retry, 401 clear without automatic loop, expiry refresh and stale completion after clear.
- Presentation checks: 320x568, 390x844, 768x1024, 1440x900 and 320x420 at 200% text, each with/without library nav. No horizontal overflow, CTA minimum56px, nav clearance after scrolling, keyboard focus and reduced-motion spinner checked. Mobile/full-page and loading screenshots visually inspected.
- Updated real built-app security route smoke: direct `/newyear` and `/library` expose introduction before auth, failed native login is retryable, zero protected calls, closed legacy routes preserved.
- JSX ESLint passed; new browser script no-unused-vars/no-undef lint passed with Node/browser globals explicitly supplied. `node --check` and `git diff --check` passed.
- Node24 `npm run build`: Vite + AIT build succeeded in isolated `git archive HEAD` baseline plus only the four scoped files. Existing large-bundle warning remains. AIT build's printed deploymentId is artifact metadata; no deployment happened.
- Private value scan: **20 private configured values** checked in memory against **42 changed-source/build/archive entries**, **0 matches**. No credentials printed.

## Reproduction

From `fortune-cat`:

```sh
node --test scripts/*.test.mjs
# Use an installed Playwright module; no new package dependency is required.
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs WEBKIT_EXECUTABLE=/path/to/webkit/pw_run.sh node scripts/tossAccountGate.browser.mjs
```

`WEBKIT_EXECUTABLE` is optional where the installed Playwright browser already matches. `GATE_TEST_OUTPUT` optionally selects a screenshot output directory. The harness constructs an isolated fixture and cleans it afterward; no production/backend/provider requests are sent.

## Review artifact

Source baseline: `cda6b5292b9d7e3fa1eee1a9d20daaf278cdf817` plus scoped changes above.

Clean temporary AIT:
`/var/folders/0q/rrv0s8pn0d78fk2pt7fl2r400000gn/T/catbot-intro-release-h9lg8kgh/fortune-cat/fortune-cat.ait`

SHA256:
`a23d595078a534c17f1e58336ef67ae77dae3b4477ebbc1e61a82dadfa37aa69`

Screenshots:
`/var/folders/0q/rrv0s8pn0d78fk2pt7fl2r400000gn/T/catbot-intro-xbBA4e/`
Includes Chromium/WebKit 320/390 introduction with/without nav, short200%text, and visible centered loading indicator.

Build log: `/tmp/catbot-intro-build.log`.

Executor handoff completed without a commit, push, deployment or account-setting change. Root subsequently completed review and replaced the local AIT as recorded below. The user will upload the replacement and submit a new review; approval is not guaranteed.

## Root review complete

Local implementation commit: `fe1388f`. All tracked runtime source, public assets and
build/dependency configuration in the release snapshot match committed files. The route
smoke script gained two more assertions after build, which do not affect the artifact.
Root visually checked the390px introduction and WebKit centered spinner. No blocking
correctness, auth, accessibility or ownership finding. Replacing the service headline
with a login-only headline in the temporary fixture fails the rendered regression suite;
restoring the source passes all48 checks. Canonical source was never mutated.
Root scanned32 changed-source/log/container entries and decompressed AIT members against
45 available private environment values plus private-key patterns:0 matches. No values
printed. Canonical ignored AIT replaced only after successful review and hash verification.
User preview: ~/Downloads/catbot-service-intro-preview.png.

Existing user authentication, legacy mapping and restored-library flows remain unchanged.
The previous library fix is deployed and user-confirmed. This frontend-only review fix
has not been uploaded, pushed or deployed; the user must upload the new AIT and resubmit.
Do not disconnect an existing Toss account merely to expose intro: returning integration
intentionally skips it, and first-use behavior is verified with offline mocked identities.
