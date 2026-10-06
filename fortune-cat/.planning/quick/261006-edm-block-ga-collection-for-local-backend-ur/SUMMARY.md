---
mode: quick
task: 261006-edm
status: completed
completed: 2026-10-06
---

# GA collection gate for local backend URLs

Web, native Android/iOS app, and Toss mini app now gate GA on the effective backend URL. The gate does not depend on debug/release mode. Existing platform/user-type labels remain intact for permitted public backends.

## Implementation and commits

- Web (`/Users/trinity/Projects/catbot/fortunecat`, main `30ee358`): share the BFF's production/dev URL resolver; return only `analyticsEnabled` from the server root loader; establish the client gate before hydration; omit the GA script and bootstrap for blocked URLs; guard typed/legacy events, metadata and classification calls. Server-only URL/key values are not added to the client bundle.
- App (`/Users/trinity/Projects/catbot/catbot-app`, main `c295630`): gate on resolved `BFF_BASE_URL`; turn Firebase Analytics collection off/on before configuring metadata; block manual events and classification independently of initialization. Set Android/iOS startup collection defaults to false.
- Toss (`/Users/trinity/Projects/app-in-toss`, main `e9cc6f8`): gate on `VITE_API_BASE_URL`; skip `getAnalytics` and every GA SDK call for blocked URLs while retaining Firebase app initialization. First-party Supabase event storage and Toss console click tracking were not changed.

The hostname policy blocks localhost and its subdomains, `.local`, loopback/private/link-local/unspecified IPv4, IPv6 loopback/unspecified/unique-local/link-local, and local IPv4-mapped IPv6. Ports do not affect classification. Public domains/IPs remain allowed, including misleading public hostname/path strings containing `localhost`. Malformed/missing URL configuration fails closed except where the app already has an effective public fallback. Dart additionally normalizes shortened/integer/hexadecimal/octal IPv4 hostname forms because its URI parser does not normalize them like WHATWG URL.

## Verification

- Web: all 170 unit tests pass, including 51 focused URL/script/event tests. Typecheck and full production client/SSR/prerender build pass. The built client does not contain `SAJU_AI_DEV_URL` or `SAJU_AI_BASE_URL` resolution. Existing empty-chunk/unused-import/unsigned-theme-cookie build warnings remain.
- Native: all 383 Flutter tests pass, including 58 focused analytics/environment tests. `flutter analyze --no-pub` reports no issues. iOS plist validation passes. Tests verify local event/metadata/classification calls are suppressed even before initialization and public debug URLs still collect.
- Toss: 42 URL/context tests plus 12 SDK integration tests pass. `node --experimental-vm-modules --test src/lib/firebase.test.js` verifies zero GA SDK calls in local/missing-URL paths for both dev/release configurations; Firebase app initialization remains available. Changed files pass ESLint and `npm run build` generates the AIT artifact.
- Mutation review: invert the web gate; all 6 analytics client tests fail. Restore the original condition and the full suite passes. Reviewed correctness, URL boundaries, client secret isolation, and scoped diffs; `git diff --check` passes.

## Important limitation

Firebase persists `setAnalyticsCollectionEnabled` across runs, and that stored value overrides the Android manifest/iOS plist default. Therefore a previously installed app which stored collection=true may emit startup automatic events before Dart applies the local-URL gate on the first transition to a local backend. The code blocks local manual reading/payment events even before initialization, and disables SDK collection during startup. A fresh app installation or cleared application data starts with the new disabled native default. Strict zero-startup-event validation on existing native installations was not performed or claimed.

Official Firebase documentation: https://firebase.google.com/docs/analytics/ios/configure-data-collection and https://firebase.google.com/docs/analytics/android/configure-data-collection

No deployment, push, store upload or AAB generation was performed. Existing unrelated working-tree changes in all three repositories were preserved. SDK call tests do not substitute for on-device network capture.
