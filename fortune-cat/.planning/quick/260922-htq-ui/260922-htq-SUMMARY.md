---
phase: quick-260922-htq-ui
plan: "01"
subsystem: tarot
tags: [react, toss, tarot, persistence]
requires:
  - backend /tarot/sessions API
provides:
  - Conversational deep tarot in the existing Toss tarot tab
  - Durable session recovery and one-use clarifier UI
affects: [tarot]
tech-stack:
  added: []
  patterns: [Toss Storage, versioned server state, useSyncExternalStore]
key-files:
  created: [src/lib/tarotConsultation.js, src/hooks/useTarotConsultation.js, src/components/TarotConsultation.jsx, scripts/tarotConsultation.test.mjs]
  modified: [src/pages/TarotPage.jsx, src/components/TarotResult.jsx]
key-decisions:
  - Persist UUID and 64-hex capability before create; retry uncertain create with the same identity.
  - Backend owns cards, roles, follow-up limit, readings, and one-use clarifier.
  - Reuse /tarot with mode=deep so reload returns to the consultation.
requirements-completed: [TAROT-USER-1, TAROT-USER-2, TAROT-USER-3, TAROT-USER-4, TAROT-USER-5, TAROT-USER-6, TAROT-USER-7, TAROT-USER-8]
completed: 2026-09-22
---

# Conversational deep tarot for Toss

Implemented concern input → zero to two follow-ups → guidance with fixed perspectives → explicit card draw → summary-first reading → optional targeted clarifier. Existing daily draw, saved result, and sharing remain intact. Both the intro and restored daily-result screen provide consultation entry.

## Implementation

- Reuses existing card art/images, purple visual tokens, safe-area hook, API base URL, and Toss Storage. No dependency or service added.
- Persists resume credentials before creation. Optimistic versions, an in-flight operation lock, reload on conflict, and status-aware retries keep the same cards and positions.
- Separates create/answer/revise from planning, draw from interpretation, and clarifier draw from clarifier interpretation. Server error states preserve all received data.
- Shows one follow-up at a time with short choices and editable input. Guidance supports concern revision without a repeated confirmation screen.
- Results show the overall answer, expandable card readings, relationships, reality checks, and actions. Optional comparison objects use the same possibility/caution/condition labels for every alternative.
- Clarifier augments a selected existing position and keeps the original reading. Its saved card is used on retry; no redraw action is exposed.
- Storage read failures cannot silently overwrite a saved session. Corrupted credentials stay until the user explicitly starts a new consultation. Browser storage fallback is development-only.

## Verification

- `node --test scripts/tarotConsultation.test.mjs`: 13/13 passed. Covers persistence-before-create, uncertain creation, read/write storage failure, restoration, duplicate clicks, version conflicts, lost draw/answer responses, answer→plan ordering, and clarifier reuse.
- Targeted ESLint on all five changed/new source files: passed without warnings.
- `npm run build`: AIT build passed, including both React Native targets and `fortune-cat.ait` packaging.
- Full-project ESLint: 13 pre-existing errors and 11 warnings in unrelated files. See `deferred-items.md`.
- Parent browser QA passed at 390×844 on the actual app and local PostgreSQL-backed API with deterministic AI: “이직해야 할까요?” → one follow-up → option answer → guidance → draw → reading → target selection → clarifier → full reload. The same cards (별/연인 and 확인 카드 악마) remained after reload.
- Parent verified `scrollWidth <= viewport`, existing card art, and collapsed details visually in `/tmp/catbot-tarot-qa/toss-result.png`.
- During local QA database misconfiguration, a real network-error retry preserved credentials and recovered after the local backend was fixed. No frontend correction was needed.
- Parent separately validated eight intent cases plus reading and clarifier against the real AI provider; the browser UI run itself used deterministic AI.

## Commits

- `c9faaf6`: failing recovery tests (RED).
- `9d48f14`: durable API and storage controller (GREEN).
- `6bf7fde`: complete consultation/clarifier UI and recovery hardening.
- `8b4172a`: consistent alternative comparison fields.
- `625ecc6`: mobile stage scroll and nearby clarifier loading state.

## Deviations and limits

- Added a small entry action to `TarotResult.jsx` because existing daily restoration bypasses the intro.
- Used Node's built-in test runner because the repository has no test framework; package manifests/lockfiles remain unchanged.
- Production requires deployment of the backend API and its Supabase migration before release. No deployment or push was performed.
- Native Toss Storage on-device, native back behavior, and device safe-area behavior were not tested. They require a Toss device or simulator; browser QA used development storage fallback and cannot prove native bridge behavior.

## TDD gate compliance

The initial Node tests failed because the controller did not exist; the RED test commit precedes the passing implementation commit. Subsequent focused regression tests were added for storage recovery and multi-request transitions.
