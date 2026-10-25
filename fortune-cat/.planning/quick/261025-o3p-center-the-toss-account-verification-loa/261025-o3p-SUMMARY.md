# Center Toss account verification loading state

## Implemented

- Moved the busy message from the bottom action area into a dedicated status group centered horizontally and vertically within the gate’s available content area.
- Added a local 36px CSS spinner using existing primary/neutral colors. It needs no external image request and respects reduced-motion preferences. The spinner is hidden from assistive technology; the surrounding status region announces the visible message once.
- Increased status text to 1.125rem (18px at the default root size), with weight 600, centered text and 20px indicator spacing.
- Retained safe-area padding and the existing library bottom-navigation reservation. The manual title, errors and login action remain available after busy state ends.
- Authentication restoration, session expiry, login and account state logic are unchanged.

## Verification

- Focused ESLint on `TossAccountGate.jsx`: passed.
- `git diff --check` on both changed component files: passed.
- Browser layout checks, full existing tests, AIT build and scoped local commit are handled by the parent release workflow.
- No new style-only tests, production/provider calls, commits, pushes or deployments were performed by this executor. Existing unrelated work is preserved.


## Parent verification

- Clean release snapshot excludes unrelated Tarot WIP. Existing offline suite: 130 passed, no failed or skipped tests.
- Chromium and WebKit:20 viewport/navigation combinations passed centered group geometry, text>=18px, spinner presence, no horizontal overflow, manual failure/retry and automatic success. Includes320/390/768/1440px and short320px viewport at200% text. Network restricted to loopback. Final screenshot inspected and the colored spinner is visible.
- Node24 production AIT build passed; existing large-chunk warnings remain. Artifact refreshed from isolated source. No production/provider/payment requests, push, deployment or publication.
