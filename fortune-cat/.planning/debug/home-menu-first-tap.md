---
status: human-verify
trigger: 토스 미니앱에서 스크롤 후 메뉴 첫 클릭은 스크롤만 움직이고 두 번째 클릭에 진입
created: 2026-10-08
---

## Symptoms
Expected: Scrolling down and tapping a menu opens it on the first tap.
Actual: First tap moves scroll; second tap opens menu.
Environment: Toss miniapp, platform not yet confirmed. No error reported.
Timeline: Unknown.

## Current Focus
hypothesis: Pending banner refresh collapses the hero and shifts document scroll.
next_action: Confirm the exact first-tap symptom in the Toss sandbox.

## Evidence

## Reasoning checkpoint
hypothesis: Foreground banner refresh clears the current banner array before fetching, unmounting the hero and moving the vertical page under a menu interaction.
confirming_evidence:
- useHomeBanners invokes setBanners([]) on window focus, visible visibilitychange and persisted pageshow. HomeHeroCarousel returns only an absolutely positioned h1 when empty.
- Controlled Chromium run on the real local app, with mocked DB and a held refresh response: scrollY changed 487 to 288; hero disappeared.
falsification_test: Keeping the existing banner array while the same request is pending should leave scrollY and menu coordinates unchanged.
fix_rationale: Preserve the current hero only while pending, then apply the completed DB response, including removal/error. No pointer/click suppression.
blind_spots: Chromium anchoring preserved the click target and navigated on its first click. The exact native Toss first-tap cancellation has not been reproduced.

## Eliminated
- Carousel timer uses element.scrollTo(left) only; no document vertical scrolling code in the home page.

## Fix and validation
- Removed the pending setBanners([]); completed responses, including empty/error responses, still replace the banner data.
- Controlled Chromium before: scrollY 487 -> 288, hero absent. After: 487 -> 487, hero mounted, first press navigates to /newyear.
- WebKit also reproduced the 199px shift before the fix. Neither desktop engine reproduced the native swallowed first click.
- Persisted browser regression holds a focus refresh between pointer down/up, verifies unchanged scrollY/hero height/menu coordinates, and verifies the selected route on first press.
- node --test scripts/homeBanners.test.mjs: 9/9 passed.
- scripts/homeBanners.browser.test.cjs on local Vite with all external requests mocked: all 8 reported groups passed, including lifecycle/removal/error/stale response and navigation.
- Focused ESLint and git diff --check passed.
- Existing tarotRuntime changes were not touched. No deployment or push.

## Human verification
Open the updated local Toss sandbox, scroll down from the home screen, and tap a menu once. Confirm immediate entry without a preliminary scroll movement. Native UI automation was unavailable; keep this session open until confirmed.
