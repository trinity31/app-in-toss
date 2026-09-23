---
phase: quick-260922-lcx
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/TarotConsultation.jsx
  - src/components/TarotConsultation.css
  - src/pages/TarotPage.jsx
  - src/pages/TarotPage.css
autonomous: true
must_haves:
  truths:
    - Every ongoing consultation request visibly displays an animated spinner and the exact text 잠시만 기다려 주세요 in the viewport center.
    - Busy UI blocks repeated interactions and honors reduced motion until the existing controller finishes the entire request chain.
    - Tarot landing offers 오늘의 운세 and 심화 타로상담 in an equal-height 1-to-2 width ratio.
    - Existing daily handlers, resume action, and result entry remain unchanged.
  artifacts:
    - path: src/components/TarotConsultation.css
      provides: Centered responsive busy indicator with reduced-motion styling
    - path: src/pages/TarotPage.css
      provides: Responsive warm-purple two-card entry layout
  key_links:
    - from: src/components/TarotConsultation.jsx
      to: useTarotConsultation busy
      via: overlay lifetime follows existing serialized request chain
---

<objective>
Apply the user's Toss-only visibility feedback. Reuse the warm pastel cat identity and current consultation controller. Do not touch backend, web, Android, or unrelated changes.
</objective>

<tasks>
<task type="auto">
<name>Show unmissable consultation request progress</name>
<files>src/components/TarotConsultation.jsx, src/components/TarotConsultation.css</files>
<action>Add a lightweight fixed viewport-centered busy scrim over the whole app while the existing busy flag is true, also covering initial restoration if appropriate. Include a visible animated spinner and exact text “잠시만 기다려 주세요”, status/live accessibility, reduced-motion behavior, and pointer/keyboard interaction blocking while retaining the original page data. Ensure it lasts through chained draw/interpret and clarify/interpret-clarifier calls and retries. Remove competing offscreen-only progress labels. Do not alter API behavior.</action>
<verify><automated>node --test scripts/tarotConsultation.test.mjs</automated></verify>
<done>Spinner stays visible in the viewport across request chains and disappears on completion or failure without changing cards.</done>
</task>
<task type="auto">
<name>Emphasize deep consultation in the tarot landing</name>
<files>src/pages/TarotPage.jsx, src/pages/TarotPage.css</files>
<action>Replace the tall mascot and stacked small CTAs with a small mascot header and two side-by-side card buttons, widths 1fr and 2fr, equal minimum height approximately 240px. The daily card is neutral, titled 오늘의 운세, and retains its original draw/resume text and handler. The larger deep card is stronger purple and titled 심화 타로상담. Use responsive narrow typography and no horizontal overflow. Preserve existing result entry and consultation mode. Validate changed files, existing recovery tests, build, and mobile dimensions.</action>
<verify><automated>./node_modules/.bin/eslint src/components/TarotConsultation.jsx src/pages/TarotPage.jsx &amp;&amp; npm run build</automated></verify>
<done>Daily/deep entry cards measure a 1:2 width ratio with equal heights and remain readable on narrow mobile screens.</done>
</task>
</tasks>

<verification>Run existing 13 controller tests and targeted lint/build. Browser-check landing geometry and loading visibility at mobile width using delayed requests where available. Native Toss verification remains separate.</verification>
<output>Write 260922-lcx-SUMMARY.md, update STATE.md, and commit only this task's files without pushing.</output>
