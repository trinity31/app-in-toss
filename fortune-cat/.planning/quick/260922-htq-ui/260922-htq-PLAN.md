---
phase: quick-260922-htq-ui
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/tarotConsultation.js
  - src/hooks/useTarotConsultation.js
  - src/components/TarotConsultation.jsx
  - src/components/TarotResult.jsx
  - src/pages/TarotPage.jsx
  - scripts/tarotConsultation.test.mjs
autonomous: true
requirements: [TAROT-USER-1, TAROT-USER-2, TAROT-USER-3, TAROT-USER-4, TAROT-USER-5, TAROT-USER-6, TAROT-USER-7, TAROT-USER-8]
user_setup: []
must_haves:
  truths:
    - Existing daily one-card draw, saved result, sharing, and midnight reset remain usable.
    - Deep consultation is reachable from the tarot tab even when today's one-card result is restored.
    - A concern leads through zero to two single follow-up questions, guidance, an explicit draw, reading, and at most one clarifier.
    - Refresh, retry, and repeated clicks never replace server-assigned cards or position meanings.
    - User sees a concise answer, expandable position readings, relationships, reality checks, and actionable advice.
  artifacts:
    - path: src/lib/tarotConsultation.js
      provides: Session API client and validated resume credentials
    - path: src/hooks/useTarotConsultation.js
      provides: Persistent session lifecycle and serialized mutations
    - path: src/components/TarotConsultation.jsx
      provides: Complete interactive Korean consultation interface
  key_links:
    - from: src/pages/TarotPage.jsx
      to: src/components/TarotConsultation.jsx
      via: Separate one-card and deep-consultation entry actions
    - from: src/hooks/useTarotConsultation.js
      to: /tarot/sessions
      via: VITE_API_BASE_URL, X-Tarot-Token, persisted id, and mutation version
---

<objective>
Implement the Toss miniapp portion of conversational deep tarot after the backend is implemented and its final contract is verified. Preserve the existing daily tarot experience and reuse card art, Toss Storage, visual tokens, safe-area handling, and the existing API base URL. Do not implement backend, web, or Android source in this plan.
</objective>

<context>
@CLAUDE.md
@.planning/STATE.md
@.planning/codebase/TESTING.md
@src/pages/TarotPage.jsx
@src/components/TarotCardArt.jsx
@src/components/TarotResult.jsx
@src/hooks/useTodayDrawStorage.js
@src/hooks/useSafeAreaInsets.js
@src/assets/images/cards/index.js
@src/components/DeepReadingLoading.jsx

Discovery: internal reuse, no new dependencies. Existing testing is ESLint, AIT build, and actual UI checks; add narrowly scoped Node built-in tests for API/recovery behavior without installing a runner. Existing daily selection is Fisher-Yates over fetched Supabase cards; leave this implementation intact. Deep draws belong to the backend, never the AI or a new client shuffle. Existing daily restore can automatically show its result, so a deep-consultation entry only in the intro would be unreachable for returning users.

Execution prerequisite: parent finishes backend before these tasks start. Read final backend schemas and route tests first. Tentative contract: create POST /tarot/sessions with {id: UUID, question}; client creates a cryptographically random 32-byte session secret, persists it with id before creation, and sends X-Tarot-Token on every request. GET /tarot/sessions/{id}; POST /{id}/plan, answer, revise, draw, interpret, clarify, with optimistic version and answer/question/target_index as appropriate. Full state includes id, version, question, answers, pending_question {question, options}, plan {summary, spread, positions, limitations, conditions, alternatives}, cards, reading {answer, positions [{card_id, position, interpretation}], relationships, reality_checks, actions}, clarifier {target_index, card, reading}, status, error. Match actual final schema rather than guessing lifecycle strings. No credentials or concern text in analytics or logs.

User requirement resolutions: maximum TWO additional questions follows the stricter completion criterion and also stays within the earlier maximum-three ceiling. Approved initial arrays contain two or three cards; the four-card prose example is not a new approved array. Comparison requires actual supplied alternatives, including three only if three are known. Clarifier never makes a deterministic decision for the user.
</context>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Persist and recover backend consultation sessions</name>
  <files>src/lib/tarotConsultation.js, src/hooks/useTarotConsultation.js, scripts/tarotConsultation.test.mjs</files>
  <behavior>
    - Credentials are persisted before the first create request; retrying an uncertain create uses the same id and secret.
    - Reload uses GET and keeps the server's cards, positions, answers, and clarifier state unchanged.
    - Concurrent clicks produce a single in-flight mutation; stale-version responses refresh state before retry decisions.
    - Interpret and clarifier failures preserve existing assigned cards and allow the appropriate retry without another draw.
    - Storage failure does not silently start an unrecoverable consultation, and corrupted credentials show a recoverable error.
  </behavior>
  <action>After confirming the final backend contract, write focused Node tests and the API/storage helpers with injectable fetch/base URL/storage where useful. Reuse Toss Storage under a separate consultation key; use browser localStorage only as a supported development fallback consistent with existing app storage usage. Await credential persistence and retain submitted concern needed to retry uncertain creation. Never reuse or overwrite the daily-draw key. Add a hook owning authoritative server state, loading/error/retry operation, and a ref-based in-flight lock. Perform explicit create then plan if required by the final contract; answer/revise re-plan according to backend behavior. On errors reload the same session before deciding which operation remains pending; do not clear cards or credentials on network errors, unauthorized responses, or a lost response. Distinguish not-found after uncertain creation from network failure. Render friendly errors rather than server internals. Abort or suppress unmounted requests without assuming cancellation rolled back server mutations. Do not log tokens or user input.</action>
  <verify><automated>node --test scripts/tarotConsultation.test.mjs</automated></verify>
  <done>Contract tests prove stable session recovery, auth headers, version propagation, duplicate-click prevention, and retry preservation using deterministic fake responses.</done>
</task>

<task type="auto">
  <name>Task 2: Deliver the complete deep tarot interaction within the existing tab</name>
  <files>src/components/TarotConsultation.jsx, src/pages/TarotPage.jsx, src/components/TarotResult.jsx</files>
  <action>Add a separate deep-consultation entry alongside the existing daily draw and ensure the restored daily-result path also offers it. Keep /tarot and its tab active; isolate deep mode so daily storage effects cannot force it back to the daily result. Reuse TarotCardArt, getCardImageUrl, safe-area spacing, typography, and existing color tokens. Start with “어떤 고민이 있나요?”, optional examples, a labelled textarea, and one primary action. Display one server-provided follow-up at a time, choice buttons plus free entry, with no spread menu or fabricated alternatives. Guidance shows summary, exact card count, all position meanings and limitations, “카드 뽑기” and “고민 수정” without a confirmation screen. Editing before draw re-runs server planning. Explicit card draw invokes only the server draw; show face-down existing art before the action and face-up assigned cards afterward, then interpret the same cards. Results appear in required order: concise overall answer; expandable labelled cards and position readings; relationships; reality checks; actions. Render persisted content as text, not raw HTML. Provide the self-reflection and high-stakes guidance in brief Korean. A user selects which existing position needs clarification and draws one clarifier; show its target, card, and supplement while retaining all original content. Once used, replace its action with the result; retry uses the existing clarifier card. Map statuses to plain Korean progress and errors, keep error retries beside preserved state, disable conflicting actions during requests, provide accessible labels/status announcements, and ensure long text and mobile safe areas do not overlap the floating tab bar. Returning to daily mode must not erase a consultation.</action>
  <verify><automated>npx eslint src/lib/tarotConsultation.js src/hooks/useTarotConsultation.js src/components/TarotConsultation.jsx src/pages/TarotPage.jsx</automated></verify>
  <done>Users can finish every consultation step and resume it from the same tab without altering the existing one-card result or exposing internal classification values.</done>
</task>

<task type="auto">
  <name>Task 3: Verify API recovery and the actual mobile interface</name>
  <files>scripts/tarotConsultation.test.mjs, .planning/quick/260922-htq-ui/260922-htq-SUMMARY.md</files>
  <action>Run targeted Node tests, project lint, and AIT build; distinguish pre-existing lint problems from new ones and resolve new failures. Use the available browser tooling against the actual development app with backend integration or controlled network fixtures. Exercise clear current-state, ambiguous job-change, progression, known two-/three-alternative, and composite concerns; zero-question and two-question paths; uncertain fallback guidance; question revision; exact counts and position meanings; draw and interpret failure recovery; refresh before/after draw and after clarifier; repeated clicks; storage and network errors. Verify cards remain unique and fixed using visible ids and response records, and clarifier appears once with a different id. Check the daily draw, saved daily result, home action and sharing entry still function, including deep entry from a restored daily result. At narrow mobile width confirm no horizontal overflow, readable collapsed results, and CTA/tab/safe-area clearance. Native-only bridge behavior must be reported honestly if no Toss device/simulator is accessible. Record tests and remaining deployment/device constraints in the summary; do not deploy, add monetization, add a history screen, or modify other apps.</action>
  <verify><automated>node --test scripts/tarotConsultation.test.mjs &amp;&amp; npm run lint &amp;&amp; npm run build</automated></verify>
  <done>Evidence covers the entire real UI path and failure/reload behavior, and the concise summary names exact checks passed and any actual environment limitations.</done>
</task>
</tasks>

<verification>
Backend contract and behavior tests precede execution. Tasks run sequentially: API/recovery → UI integration → full checks. AI spread semantics, schema validation, security rules, random extraction, and transactional idempotency are backend-owned; this UI consumes and preserves those decisions and tests the observable behavior. Existing single-card randomness remains untouched.
</verification>

<success_criteria>
All eight user requirement groups are satisfied for the Toss interface; there is no change to existing daily card data or storage. Server-owned session identity/cards survive retries and reloads. A two- or three-card reading plus at most one clarifier works on mobile with concise Korean content, clear loading and recoverable error states. No new npm dependency or storage service is introduced.
</success_criteria>

<source_audit>
GOAL: User's conversational tarot objective for Toss is covered by Tasks 1–3; existing ROADMAP has no active deep-tarot phase, so this is the authorized quick task.
REQ: User sections 1–4 are covered by Task 2; sections 5 and 7 by Tasks 1–2 with backend prerequisite; section 6 by Task 2 and backend interpretation policy; section 8 by Tasks 1 and 3.
RESEARCH: No new RESEARCH.md exists. Inspected existing code constraints (card art, Storage, daily restore, safe areas, API base, absent test runner) are covered by Tasks 1–3.
CONTEXT: No new CONTEXT.md exists. User's backend→Toss→web→Android ordering is enforced by prerequisite and scope. Existing stack, single Supabase service, zero new dependencies, and one-card preservation are covered. No deferred history, monetization, or cross-app changes are introduced.
</source_audit>

<output>
After implementation, write .planning/quick/260922-htq-ui/260922-htq-SUMMARY.md with changes, verification evidence, and actual limitations. Parent controls execution and commits; this planning handoff does not commit.
</output>
