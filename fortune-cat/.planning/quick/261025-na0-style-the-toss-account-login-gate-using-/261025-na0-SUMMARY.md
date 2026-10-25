# Toss account gate presentation

## Result

Styled the existing explicit-login gate using the app's pink primary and neutral tokens, 20px mobile gutters, a 22px heading, readable copy, and a full-width 56px action. The warning that anonymous readings are not automatically linked remains visible in its own labelled note.

The action stays in document flow, so long content, enlarged text, and login errors can scroll without being hidden beneath a fixed button. It uses the existing native safe-area hook; the library route reserves extra space above its floating navigation. The gate has an accessible heading, visible keyboard focus, announced error and loading messages, and a disabled busy action.

## Scope

- `src/components/TossAccountGate.jsx`: presentation and accessibility only; existing login, session subscription, expiry, authenticated children, and error/retry behavior retained.
- `src/components/TossAccountGate.module.css`: locally scoped responsive layout and state styles.
- `src/App.jsx`: presentation flag for library navigation spacing.

No changes to backend authentication, identity, ownership, purchases, or quota behavior. Existing tarot runtime and test WIP and sibling app files remain untouched.

## Executor checks

- Focused ESLint on the gate and App: passed.
- Offline Toss account and authenticated reading transport tests: 17 passed.
- `git diff --check`: passed.

Parent verification: 105 offline client tests passed against a clean release snapshot excluding unrelated tarot WIP. Chromium and WebKit passed 20 rendered viewport/navigation combinations (320–1440px, short viewport at 200% text), including idle, pending/disabled login, error/retry, authenticated children, focus, warning visibility, and no horizontal overflow or navigation overlap. Browser network access was restricted to loopback. No production requests, paid services, push, deployment, or publication were performed.

Node24 AIT production build passed. The clean snapshot artifact was copied to `fortune-cat.ait` for user upload. Existing large-chunk warnings remain. Changes are committed locally only; root did not push or deploy.

## Suggested mocked browser checks

Render the actual gate with aliases for `tossSession` and `useSafeAreaInsets`, keeping both entirely local. Exercise idle, a pending login promise, failure/retry, and authenticated child rendering at 320px, a representative phone, 768px, and desktop. Repeat the narrow, short viewport with 200% root text size. Assert visible anonymous-history text, action height, focus outline, no horizontal overflow, no duplicate login while busy, announced errors, and a reachable CTA above a mocked library navigation and nonzero native safe-area bottom inset.
