---
phase: quick-260922-f2m
plan: 01
status: complete
commit: 83c924b
---

# Limited-time purchase discount display

Implemented console campaign presentation at all three purchase surfaces: initial deep-reading unlock, followup pack, and followup bundle. After user screenshot feedback, shared `PurchasePromotion` shows only the struck original price, bold discounted price, and short “기간 한정 할인” label. The badge, end-date label and long eligibility/checkout paragraph were removed as requested.

- Followup pack: 1,980원 → 990원, policy 855.
- Deep reading: 4,950원 → 2,475원, policy 857.
- Active window: September 22, 2026 00:00 KST inclusive through October 22, 2026 00:00 KST exclusive.
- Hook refreshes at campaign boundaries and on visibilitychange, pageshow, and focus; timers cap at one day and clean up on unmount.
- The followup fixed panel scrolls within viewport space above the bottom bar and below the top inset.

Checkout product records, SDK `displayAmount`, amount resolution, grant code, free unlock, credit redemption, and loading/disabled behavior remain unchanged. Expired campaigns use existing SDK price labels. No backend accounting change, dependency, deployment, or push.

## Verification

- Targeted ESLint on four edited source files: passed.
- Vite production build: passed, 693 transformed modules. Existing mixed static/dynamic SDK imports and large bundle warnings remain.
- Node assertions: passed at one millisecond before start, exact start, final active millisecond, exact exclusive end; checked UTC equivalents of explicit KST boundaries and both product price pairs.
- `git diff --check`: passed. Source commit includes only the four implementation files.
- Aside browser: actual shared component rendered in an isolated preview at 320px and 390px widths; badge, date, prices and conditions fit without clipping. Toggling the preview inactive removed promotion markup and restored original-price sample CTAs. This was component presentation validation, not full app navigation or a browser-resume test.
- Real Toss device checkout was not executed. Eligibility and final charged amount remain determined by Toss.

## Files

- `src/config/purchasePromotions.js`: campaign metadata and pure active-window predicate.
- `src/hooks/usePurchasePromotion.js`: live campaign status with boundary/resume handling.
- `src/components/PurchasePromotion.jsx`: shared accessible text/price presentation.
- `src/components/DeepReadingResult.jsx`: all three paywall integrations and bounded followup panel.

## Deviations

Added a small shared presentational component beyond the plan's initial three source paths to avoid repeated promotional markup and let the independent browser harness render the actual component. No other scope expansion.

## Screenshot feedback revision

- Removed the 50% badge, end-date label, and eligibility/checkout paragraph from the shared component, affecting all three purchase surfaces.
- Removed the now-unnecessary top spacing on the price row.
- Kept conditional price wording, CTA behavior and automatic expiry.
- Source diff reviewed; targeted ESLint and diff whitespace check passed. No deployment.

## Final copy revision

- Replaced the price-side label with “기간 한정 할인”.
- Followup buttons: “990원으로 질문 10회 받기” and “2475원으로 질문 10회 + 풀이 1회”; active CTA amounts omit thousands separators.
- Initial deep-reading CTA also omits the old qualifier and preserves its full-reading description.
- Loading, checkout and expiry behavior unchanged. No deployment.
