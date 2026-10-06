---
mode: quick
task: 261006-edm
status: planned
---

# Block GA collection when the configured backend URL is local

The web, native app, and Toss mini app must suppress both automatic and manually emitted GA events when their effective backend URL points to a local development host. Production backend URLs must retain existing analytics behavior. Preserve unrelated working tree changes and do not deploy or upload artifacts.

## URL rule

Parse the URL and compare the normalized hostname, never a substring of the complete URL. Block `localhost`, subdomains of `.localhost`, `.local` names, IPv4 loopback (`127.0.0.0/8`), private IPv4 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and IPv6 loopback/link-local/unique-local addresses. Treat malformed or missing URLs conservatively, using the actual application fallback URL if one exists. Keep equivalent address rules in all three clients. Include IPv4-mapped IPv6 handling if the parser permits these hosts.

## Tasks

1. **Web, `/Users/trinity/Projects/catbot/fortunecat`.** Inspect backend URL resolution and reuse its effective `SAJU_AI_DEV_URL` versus production `BASE_URL` selection. Add a small tested hostname predicate. Have the server root loader expose only an analytics-enabled boolean, not the backend URL or credentials. Conditionally omit both the gtag loader and bootstrap when blocked. Guard legacy/manual event helpers and classification metadata calls so a preexisting `window.gtag` cannot bypass the gate.

2. **Native app, `/Users/trinity/Projects/catbot/catbot-app`.** Gate on the effective `BFF_BASE_URL`. Default Firebase Analytics collection to disabled in Android manifest and iOS plist to prevent startup automatic events before Dart runs. In analytics initialization, call the SDK collection toggle before default parameters/user properties are configured; enable only for permitted backend URLs. Guard manual event methods and any observer integration consistently. Preserve non-analytics Firebase services and normal production collection.

3. **Toss mini app, `/Users/trinity/Projects/app-in-toss/fortune-cat`.** Gate on effective `VITE_API_BASE_URL`. When blocked, skip `getAnalytics` initialization and all `logEvent` calls, including automatic collection setup. Keep Firebase app initialization available to other services. Do not expand the change to unrelated first-party event storage.

4. **Verify and record.** Add focused table-driven tests per platform for localhost, `.localhost`, `.local`, LAN IPv4, IPv6 local, ports, public HTTPS/IP hosts, and misleading public host/path names containing `localhost`. Verify disabled paths cause zero SDK/event calls while public-backend paths retain collection and existing event metadata. Run each repository's relevant tests and type/analyzer/build checks. Review only scoped diffs, document results and any limitations in the quick-task summary, and commit only task files when the parent workflow authorizes it.

## Done when

- Local backend URLs produce no GA startup, page/screen, or manual reading/payment events on all three clients.
- Public backend URLs still collect existing GA events and platform/user labels.
- The web bundle receives no private backend URL or secret from the gate.
- Focused tests pass, and unrelated user changes remain untouched.
