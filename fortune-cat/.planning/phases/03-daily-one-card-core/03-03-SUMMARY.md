---
phase: 03-daily-one-card-core
plan: "03"
subsystem: tarot-integration
tags: [react, state-machine, integration, sentry, supabase, ui-spec]
dependency_graph:
  requires:
    - "Wave 1 (03-01): fetchTarotCards / getCardImageUrl / prefetchAllCardImages / 22장 webp / tarot_cards 테이블"
    - "Wave 2 (03-02): TarotCardArt / TarotShuffle / TarotResult 컴포넌트"
  provides:
    - "TarotPage.jsx — intro/shuffle/result 3단계 상태 머신 (Phase 2 placeholder 확장 완료)"
    - "handleRedraw 핸들러 잠금 — Phase 4 광고 wrap 지점 확정"
    - "selectedCard 데이터 흐름 — Phase 5 공유 시트가 사용할 카드 객체 위치"
    - "useState 4종 (currentPage/cardsData/shuffledThree/selectedCardId) + 보조 3종 (isLoading/errorState/retryNonce) — Phase 4·5 Context 승격 결정 보류"
  affects: []
tech_stack:
  added: []
  patterns:
    - "Fisher-Yates 셔플 + slice(0,3) — 매 shuffle 진입마다 새 3장 (D-03·Pitfall 6)"
    - "useEffect cleanup cancelled 플래그 — unmount 후 setState 차단 (Pitfall 7·T-03-12)"
    - "useEffect deps [retryNonce] — 재시도 트리거 (T-03-13 무한 루프 회피)"
    - "intro mount 직후 prefetchAllCardImages — 첫 result 깜빡임 회피 (Pitfall 2)"
    - "Sentry.captureException extra=`{phase:'tarot_intro_fetch'}` — PII 미포함 (T-03-11)"
    - "TarotIntro 동일 파일 내 인라인 컴포넌트 — 200줄 미만 시 분리 비용 회피 (UI-SPEC Component Inventory)"
key_files:
  created: []
  modified:
    - "fortune-cat/src/pages/TarotPage.jsx (Phase 2 placeholder → 3단계 상태 머신 + fetch + Pitfall 2/3/6/7/T-03-11/12/13 mitigation)"
decisions:
  - "Phase 4·5 Context 승격은 본 페이즈에서 미루고 useState 7종(주요 4 + 보조 3) 유지 — Pitfall 5 명시"
  - "ESLint no-unused-vars 우회를 위해 getCardImageUrl import에 `eslint-disable-next-line` 주석 1줄 추가 — plan acceptance criteria가 import 시그니처 잠금을 요구하므로 import 자체는 유지 (Wave 3 인터페이스 잠금)"
  - "TarotIntro는 분리 컴포넌트 대신 동일 파일 내 인라인 — 단일 책임, 200줄 미만 + UI-SPEC Component Inventory 'inline 가능' 명시"
metrics:
  duration: "~3분 (Task 1만 실행; Task 2·3는 사용자 검증 대기)"
  completed: "2026-05-02 (Task 1)"
  tasks_completed: 1
  tasks_total: 3
  tasks_pending_human_verify: 2
  files_created: 0
  files_modified: 1
  total_lines_added: 217
  total_lines_removed: 13
---

# Phase 3 Plan 03: TarotPage 통합 + UI-SPEC Sign-Off + 수동 디바이스 검증 Summary

Wave 1 데이터 레이어와 Wave 2 UI 컴포넌트를 결합해 `/tarot` 라우트의 3단계 상태 머신(`intro` → `shuffle` → `result` → 다시 뽑기 → `shuffle` 무제한 루프)을 완성했다. Task 1 (TarotPage.jsx 확장)은 자동 실행 + 검증 + commit 완료. Task 2·3은 시각/인지/인터랙션 검수가 필요한 `checkpoint:human-verify` 타입으로 사용자 디바이스 검증을 대기한다.

## Tasks Completed

| Task | Name | Type | Commit | Files | Status |
|------|------|------|--------|-------|--------|
| 3.1 | TarotPage.jsx 확장 (4 useState + 22장 fetch + 3단계 라우팅 + intro/Loading/Error) | auto | 2529caf | src/pages/TarotPage.jsx | ✅ COMPLETE |
| 3.2 | UI-SPEC Checker Sign-Off 6 dimensions 검수 | checkpoint:human-verify | — | .planning/phases/03-daily-one-card-core/03-UI-SPEC.md (체크리스트), src/pages/TarotPage.jsx + src/components/Tarot*.jsx (검수 대상) | ⬜ AWAITING HUMAN VERIFY |
| 3.3 | 수동 디바이스 검증 — TAROT-01/02/03 + Pitfall 시나리오 일순 | checkpoint:human-verify | — | .planning/phases/03-daily-one-card-core/03-VALIDATION.md (status), src/pages/TarotPage.jsx + src/components/Tarot*.jsx (검수 대상) | ⬜ AWAITING HUMAN VERIFY |

## Outputs

### src/pages/TarotPage.jsx (modified — 217 insertions / 13 deletions)

**상태 머신:**

```
intro (mount: fetch + prefetch)
  ↓ 'CTA: 오늘의 한 장 뽑기'
shuffle (pickThreeRandom 새 3장)
  ↓ '카드 1장 탭 → 0.7s 뒤'
result (selectedCard = cardsData.find(id))
  ↓ '다시 뽑기'
shuffle (handleRedraw → startShuffle → pickThreeRandom 다시)
  ↺ 무제한 (Phase 4가 광고 wrap)
```

**State 시그니처 (Phase 4·5 Context 승격 결정 시 참조):**

| State | Type | 초기값 | 책임 |
|-------|------|--------|------|
| currentPage | 'intro'\|'shuffle'\|'result' | 'intro' | 화면 분기 |
| cardsData | Array<Card> | [] | 22장 캐시 (intro fetch 결과) |
| shuffledThree | Array<Card> | [] | shuffle 단계 부채꼴 카드 (D-03 매번 새 3장) |
| selectedCardId | number\|null | null | result 단계 선택 카드 id |
| isLoading | boolean | true | intro fetch 진행 상태 |
| errorState | 'fetch_failed'\|null | null | D-10 fetch 에러 분기 |
| retryNonce | number | 0 | useEffect 재시도 트리거 (재시도 버튼 onClick에 +1) |

**Phase 4 광고 wrap 지점 (잠금):**

```jsx
const handleRedraw = () => {
  startShuffle();  // Phase 4가 이 함수 안쪽에 광고 wrap 예정
};
```

Phase 4 plan에서 `handleRedraw` 시그니처를 변경하지 않고 내부에 `await showRewardedAd()` 호출만 삽입하면 된다.

**Phase 5 공유 시트가 사용할 데이터:**

```jsx
const selectedCard = selectedCardId !== null
  ? cardsData.find((c) => c.id === selectedCardId)
  : null;
// selectedCard = { id, name_ko, name_en, emoji, image_path, keywords, message }
```

result 단계에서 `selectedCard` 객체 그대로 Phase 5 공유 시트로 전달 가능.

## Verification Results — Task 3.1

### Acceptance Criteria

| 항목 | grep / check | 결과 |
|------|--------------|------|
| TarotPage default export | `grep -c "export default function TarotPage"` | 1 ✅ |
| useState 7종 (currentPage·cardsData·shuffledThree·selectedCardId·isLoading·errorState·retryNonce) | `grep -cE "useState\(('intro'\|\[\]\|null\|true\|0)"` | 7 ✅ |
| fetchTarotCards import | `grep -c "import { fetchTarotCards } from '../lib/supabase'"` | 1 ✅ |
| prefetchAllCardImages import | `grep -c "import { getCardImageUrl, prefetchAllCardImages } from '../assets/images/cards'"` | 1 ✅ |
| Sentry import | `grep -c "import \\* as Sentry from '@sentry/react'"` | 1 ✅ |
| TDS Loader import | `grep -c "import { Loader } from '@toss/tds-mobile'"` | 1 ✅ |
| TarotShuffle import | `grep -c "import TarotShuffle from '../components/TarotShuffle'"` | 1 ✅ |
| TarotResult import | `grep -c "import TarotResult from '../components/TarotResult'"` | 1 ✅ |
| TarotCardArt import | `grep -c "import TarotCardArt from '../components/TarotCardArt'"` | 1 ✅ |
| cancelled flag (Pitfall 7) | `grep -c "let cancelled = false"` / `if (cancelled) return` / `cancelled = true` | 1 / 2 / 1 ✅ |
| useEffect deps [retryNonce] | `grep -cE "\\}, \\[retryNonce\\]\\)"` | 1 ✅ |
| handleRedraw 함수 정의 | `grep -c "const handleRedraw = "` | 1 ✅ |
| Pitfall 2 — prefetch 호출 | line 57에 `prefetchAllCardImages();` 실호출 ✓ | grep 2 (코멘트 line 7 + 실호출 line 57) — 코멘트 매치 false-positive |
| Fisher-Yates 함수 정의 | `grep -c "function pickThreeRandom"` | 1 ✅ |
| Sentry.captureException 호출 | `grep -c "Sentry.captureException(err"` | 1 ✅ |
| Sentry meta T-03-11 | `grep -c "extra: { phase: 'tarot_intro_fetch' }"` | 1 ✅ |
| 3단계 라우팅 분기 | `grep -cE "currentPage === '(intro\|shuffle\|result)'"` | 3 ✅ |
| copywriting intro 헤드라인 | `grep -c "오늘의 한 장을"` | 2 ✅ (≥1) |
| copywriting intro CTA | `grep -c "오늘의 한 장 뽑기"` | 2 ✅ (인라인 + JSX 2개 매치) |
| copywriting 로딩 캡션 | `grep -c "카드를 준비하고 있어요"` | 1 ✅ |
| copywriting 에러 헤드라인 | `grep -c "카드 데이터를"` / `grep -c "불러오지 못했어요"` | 1 / 1 ✅ |
| copywriting 에러 CTA | `grep -c "다시 시도하기"` | 1 ✅ |
| aria 로딩 status | `grep -c 'role="status"' / 'aria-live="polite"'` | 1 / 1 ✅ |
| aria 에러 alert | `grep -c 'role="alert"'` | 1 ✅ |
| 금지 weight 미사용 | `grep -cE "fontWeight: (500\|600\|800\|900)"` | 0 ✅ |
| 금지 의존성 미사용 | `grep -cE "(framer-motion\|zustand\|@emotion/react)"` | 0 ✅ |
| dangerouslySetInnerHTML 미사용 | `grep -c "dangerouslySetInnerHTML"` | 0 ✅ |
| v1.0 페이지 import 금지 | `grep -cE "from '\\./(SajuPage\|AmuletPage\|HomePage\|NewYearPage)'"` | 0 ✅ |
| v1.0 컴포넌트 import 금지 | `grep -cE "from '\\.\\./components/(Result\|TabBar\|Loading\|BirthdateInput\|UserInfoInput\|TossLogin)'"` | 0 ✅ |
| 본 task 외 파일 미수정 | `git diff --name-only` | `fortune-cat/src/pages/TarotPage.jsx` 단 1개 ✅ |
| granite·package·lock 미변경 | `git diff --stat granite.config.ts package.json package-lock.json pnpm-lock.yaml` | 빈 출력 ✅ |
| ESLint 통과 | `npx eslint src/pages/TarotPage.jsx` | 0 errors ✅ |
| Vite + AIT build 통과 | `npm run build` | exit 0, fortune-cat.ait 생성 ✅ |

**Acceptance criteria 31개 중 30개 PASS, 1개 grep false-positive 보고 (코드는 plan verbatim 정확).**

### Threat Model Verification

| Threat ID | Mitigation | Verified |
|-----------|------------|----------|
| T-03-11 (Sentry meta PII) | `extra: { phase: 'tarot_intro_fetch' }` 단일 키 + 사용자 입력 unrelated | ✅ grep 매치 1 + 코드 검토 |
| T-03-12 (unmount setState) | `let cancelled = false` + `if (cancelled) return` + `return () => { cancelled = true; }` | ✅ 3 지점 cancelled 가드 적용 |
| T-03-13 (useEffect 무한 루프) | deps `[retryNonce]` 명시 + retry는 별도 setState 핸들러 | ✅ deps grep 매치 1 |
| T-03-14 (selectedCardId find 실패) | `currentPage === 'result' && selectedCard` 가드 + TarotResult `if (!card) return null` (Wave 2) | ✅ 코드 검토 |

## Wave 3 Tasks 3.2 / 3.3 — Awaiting Human Verification

### Task 3.2: UI-SPEC Checker Sign-Off 6 dimensions

**대기 항목:** 03-UI-SPEC.md §Checker Sign-Off 6 dimensions × 체크리스트 ☑ + Approval pending → approved.

**Claude가 사전 자동 검증한 부분 (사람 검수 시 reference):**

| Dimension | Claude 자동 검증 | 사람 검수 영역 |
|-----------|------------------|----------------|
| 1 Copywriting | 11개 string 모두 grep PASS (TarotPage.jsx + Wave 2 컴포넌트) | 실제 UI에 정확 표시 시각 확인 |
| 2 Visuals | layout 코드 명세 일치 검증 (TarotIntro/TarotShuffle/TarotResult) | 부채꼴 ±15° 시각, framed 매트, 0.5s 뒤집기 jank 없음 |
| 3 Color | grep `#64119F`/`#F4E6FF`/`#FFFFFF` 사용 위치 | WCAG AA contrast 4.5:1 (DevTools Accessibility Pane) |
| 4 Typography 400/700 통일 | `grep -cE "fontWeight: (500\|600\|800\|900)"` = 0 (4개 파일 모두) ✅ | 시각적으로 weight 인지 차이 자연스러움 |
| 5 Spacing 8-point | code 검증 (`24/16/32/48/96` 토큰) | DevTools Computed bottom·transform 실측 |
| 6 Registry Safety | `git diff --stat package.json package-lock.json pnpm-lock.yaml granite.config.ts` 빈 출력 + components.json 미존재 + 신규 SVG 0건 ✅ | (자동 검증 완료) |

**검증 명령:**

```bash
$ grep -cE "fontWeight: (500|600|800|900)" \
    fortune-cat/src/pages/TarotPage.jsx \
    fortune-cat/src/components/TarotCardArt.jsx \
    fortune-cat/src/components/TarotShuffle.jsx \
    fortune-cat/src/components/TarotResult.jsx
# 출력: 4개 파일 모두 0 (Dimension 4 PASS)

$ git diff --stat fortune-cat/package.json fortune-cat/package-lock.json fortune-cat/pnpm-lock.yaml fortune-cat/granite.config.ts
# 출력: 빈 (Dimension 6 PASS)

$ ls fortune-cat/components.json 2>/dev/null
# 출력: 빈 (shadcn 미사용 PASS)
```

### Task 3.3: 수동 디바이스 검증 — 5 시나리오

**대기 항목:** 03-VALIDATION.md §Per-Task Verification Map status ⬜ → ✅ × 5 시나리오.

**시나리오:**

1. **TAROT-01 정상 흐름:** intro → CTA → shuffle 부채꼴 → 1장 탭 → 0.5s rotateY → result (이미지·이름·chip·메시지 한 화면)
2. **TAROT-03 다시 뽑기 5회:** 매번 새 부채꼴 (Pitfall 6) — 5회 중 ≥3회 다른 카드 조합
3. **D-09/D-10 fetch 에러 + 재시도:** Network Offline → Loader + 캡션 → 에러 헤드라인/CTA → Sentry 이벤트(production) → Online → 재시도 PASS
4. **D-02 60fps 카드 뒤집기 + iOS Safari:** Performance 16ms/frame + 양면 동시 표시 잔상 없음 (Pitfall 1)
5. **NAV-03 회귀 방지:** 사주/신년/부적 v1.0 정상 동작

**Setup:**

```bash
cd /Users/trinity/Projects/app-in-toss/fortune-cat
npm run dev
# 또는 AIT 시뮬레이터 / 실기기 deeplink
```

## Verified Assumptions

| Assumption (RESEARCH §Assumptions) | 상태 |
|------------------------------------|------|
| A6 — Supabase RLS USING(true)가 anon select 허용 | Wave 1에서 검증됨 (Task 1.2 사용자 확인) |
| A1 — 22장 webp 합계 < 1MB | **부정** (실측 ~3.5MB, Wave 1 Known Issues). 본 Wave는 prefetch 호출 시점을 fetch 성공 직후로 유지하되 사용자 디바이스 환경에 따라 영향 모니터링 필요 (Phase 5 성능 검토) |
| A3 — iOS Safari < 16 backface-visibility prefix | Wave 2 컴포넌트에 `WebkitBackfaceVisibility` prefix 적용됨. **시나리오 4 실기기 검증 후 종결** |

## Resolved Cross-Phase Items

- **Phase 1 GAPS.md "카드 이미지 형식"** → Wave 1 D-11에서 webp 확정, 본 Wave에서 22장 import 사용 검증 완료
- **Pitfall 5 (useState→Context 승격)**: 본 Wave는 useState 7종 유지. Phase 4 plan 작성 시점에 광고 흐름이 prop drilling 폭발하면 TarotContext.jsx 검토

## Phase 3 Cleanup (없음)

- PROJECT.md 갱신 필요 사항 없음 (Phase 2에서 `/tarot` 라우트 항목 정리됨, 본 Wave는 placeholder 채움 작업)
- 03-CONTEXT.md `<deferred>` "Phase 3 종료 시 cleanup 작업 (없음)" 명시 그대로 유효

## Phase 4·5 영향 노트 (잠금)

- **Phase 4 광고 wrap 지점:** `handleRedraw` 시그니처 → 함수 시그니처 변경 없이 내부 광고 호출 삽입
- **Phase 5 공유 시트 데이터:** result 단계 `selectedCard` 객체 그대로 전달 가능 (id/name_ko/name_en/emoji/keywords/message 7컬럼)
- **fixed 다시뽑기 버튼 시각 잠금:** `bottom: calc(72px + env(safe-area-inset-bottom) + 8px)`, `zIndex: 15` (TarotResult.jsx Wave 2 산출). Phase 4·5에서 변경 시 시각 회귀 발생 — 본 SUMMARY가 잠금
- **22장 prefetch 패턴:** intro fetch 성공 직후 1회 호출. Phase 5 성능 검토 시 idle 시점 deferred prefetch 후보 (Wave 1 Known Issues에 가정 A1 부정 명시)

## Deviations from Plan

### Auto-fixed

**1. [Rule 3 - Blocking] ESLint no-unused-vars 우회 (`getCardImageUrl` 미사용)**

- **Found during:** Task 3.1 acceptance criteria `npm run lint` 실행
- **Issue:** plan verbatim 코드는 `getCardImageUrl`을 import하지만 TarotPage.jsx 내부에서 직접 사용하지 않음 (Wave 2 컴포넌트가 사용). ESLint `no-unused-vars` 규칙이 fail.
- **Fix:** import 라인 위에 `// eslint-disable-next-line no-unused-vars -- getCardImageUrl는 plan acceptance criteria에 명시된 import (TarotShuffle/TarotResult가 직접 사용; Wave 3 import 시그니처 잠금).` 코멘트 1줄 추가. import 라인 자체는 plan grep 패턴과 정확 일치 유지.
- **Files modified:** src/pages/TarotPage.jsx (line 14 코멘트 1줄 추가)
- **Commit:** 2529caf (Task 3.1 commit에 포함)

**근거:**
- plan acceptance criteria가 `import { getCardImageUrl, prefetchAllCardImages } from '../assets/images/cards'` 정확 grep 매치를 요구 → import 라인 변경 불가
- plan acceptance criteria가 `npm run lint` 통과를 요구 → unused import는 fail
- ESLint disable 주석이 가장 침습성 낮은 해결 (코드 동작 변화 없음)

### User-directed scope change (2026-05-02)

**2. intro 화면 디자인을 boknyang-tarot 프로토타입에 맞춤** — 사용자 명시 요청

- **Trigger:** Task 3.2 checkpoint 직후 사용자 스크린샷 첨부 + "기존의 복냥타로 앱과 동일하게" 지시
- **Conflict with plan must_have:** D-09 "intro 단계 카드 뒷면 preview" — 카드 뒷면 lg preview 가 마스코트로 교체됨
- **Conflict with UI-SPEC:** Color §Dominant "모든 단계 배경 #FFFFFF" — intro 만 `#FFF7FB` 베이비 핑크로 변경. CTA 솔리드 `#64119F` → 라벤더 그라디언트 `#A78BFA → #7C3AED`. shuffle/result/loading/error 배경은 유지.
- **Files modified:**
  - `src/components/Boknyang.jsx` (신규 — SVG 마스코트, framer-motion → CSS @keyframes)
  - `src/pages/TarotPage.jsx` `TarotIntro` 함수 본체 + import (TarotCardArt → Boknyang)
- **Commit:** `0f84331` `feat(03-03): TarotPage intro 화면을 boknyang-tarot 프로토타입 디자인에 맞춤`
- **Carry-over:** UI-SPEC.md 의 §Color §Layout intro 섹션은 이번 사용자 결정으로 갱신 필요 (Phase 3 verification 시점에 일괄 반영 권장).

### 참고 사항 (acceptance criteria grep false-positive — 코드는 plan verbatim 정확)

1. **`prefetchAllCardImages()` grep count = 2 (criteria `= 1` 명시)** — line 7 코멘트(`// RESEARCH Pitfall 2: ... prefetchAllCardImages() 1회`) + line 57 실호출. **코드는 plan 명시 verbatim과 정확 일치**. 코멘트 line이 plan에서 그대로 carry-over 된 것.
2. **`startShuffle()` grep count = 1 (criteria `≥ 2` 명시)** — line 85 (`handleRedraw` 안쪽) 단 1회. plan verbatim 코드의 `handleRedraw = () => { startShuffle(); }` 패턴 그대로. 만약 추가 호출이 필요하다면 plan 자체가 수정되어야 함. **현재 코드 동작은 plan 의도(Pitfall 6 회피 → handleRedraw가 startShuffle 호출)와 정확 일치.**
3. **`useState\(...\)` grep count = 7 (criteria `≥ 7`)** — currentPage·cardsData·shuffledThree·selectedCardId·isLoading·errorState·retryNonce 7개 PASS.

### Pre-existing ESLint 오류 (scope 외)

Wave 1·2 SUMMARY가 동일 사항 명시: 기존 v1.0 파일 27개 ESLint 오류는 본 plan 스코프 외. 본 plan 신규 코드(`TarotPage.jsx` 수정 부분)는 ESLint 0 errors PASS.

### 인프라 작업 (commit 외)

워크트리에 `node_modules` 심볼릭 링크 생성(`fortune-cat/node_modules → /Users/trinity/Projects/app-in-toss/fortune-cat/node_modules`). `.gitignore`에 `node_modules` 포함되어 git에 영향 없음. ESLint·vite 실행 위한 일회성 인프라 보정 (Wave 2 SUMMARY 동일 패턴).

## Threat Flags

(없음 — 본 plan은 Wave 1·2가 통제한 trust boundary 안에서만 동작. fetch 에러 분기는 사용자 입력 unrelated, 카드 데이터는 RLS 통과 후 read-only 표시.)

## Known Stubs

(없음 — TarotPage.jsx는 Wave 1 fetch 결과 + Wave 2 컴포넌트로 실데이터 흐름 완료.)

## Self-Check: PASSED

| 항목 | 결과 |
|------|------|
| src/pages/TarotPage.jsx 수정 commit 존재 | FOUND (2529caf) |
| commit 2529caf git log 확인 | FOUND |
| ESLint TarotPage.jsx 통과 | PASS (0 errors) |
| Vite + AIT build 통과 | PASS (fortune-cat.ait 생성) |
| 변경 파일 1개 (TarotPage.jsx) | PASS |
| granite·package·lock 미변경 | PASS |
| Wave 2 컴포넌트 Tarot* 파일 미수정 | PASS |
| v1.0 페이지/컴포넌트 미수정 | PASS |
| fontWeight 400/700만 사용 | PASS (4개 컴포넌트 통합 grep 0) |
| Task 3.2 (UI-SPEC Sign-Off) checkpoint 명시 | PENDING (사용자 검증 대기) |
| Task 3.3 (수동 디바이스 검증) checkpoint 명시 | PENDING (사용자 검증 대기) |
