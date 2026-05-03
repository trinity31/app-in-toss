---
phase: 04-daily-lock-and-storage
plan: 02
subsystem: tarot-integration
tags: [react-hooks, daily-lock, kst-timezone, storage-integration, ui-spec, sentry, graceful-degradation]

# Dependency graph
requires:
  - phase: 03-daily-one-card-core
    provides: TarotPage state machine (intro/shuffle/result) + 7종 useState + handleHome/handleShare/handleRetry/startShuffle/handleSelectCard/pickThreeRandom + TarotIntro 인라인 컴포넌트
  - phase: 04-daily-lock-and-storage
    plan: 01
    provides: useTodayDrawStorage 훅 (Toss Storage 기반 영속 저장) + todayKST() 헬퍼 (Asia/Seoul ISO 날짜)
provides:
  - TarotPage.jsx — daily lock 통합 완료 (mount 시 storage 로드 + KST 자정 비교 + 분기)
  - intro CTA 분기 인터페이스 — TarotIntro({ hasTodayDraw, onStart, onResume })
  - hasTodayDraw 계산 패턴 — Boolean(todayDraw && todayDraw.date === todayKST())
  - shuffle 확정 시 todayDraw 영속 저장 — handleSelectCard 안 saveTodayDraw fire-and-forget 호출
  - 손상 데이터 자동 정리 — lock useEffect 의 cardsData.find 가 undefined → clearTodayDraw
  - 자정 리셋 동작 — date 불일치 → clearTodayDraw + intro 유지
affects: [05-share-and-analytics (already_drawn 플래그 후보 — todayDraw state 직접 접근 가능)]

# Tech tracking
tech-stack:
  added: []  # 신규 의존성 0 (P1-D-08 carry — date-fns/dayjs/framer-motion/zustand 미도입)
  patterns:
    - "별도 useEffect 로 lock 분기 처리 — fetch effect 와 분리해 race condition 회피 (T-04-07 mitigate)"
    - "fire-and-forget saveTodayDraw — await 없이 호출, setCurrentPage('result') 동기 실행 (T-04-09 mitigate)"
    - "Boolean(todayDraw && date === todayKST()) — 매 렌더 시 1회 비교, memoization 미사용 (값 1개 비교 비용 무시)"
    - "loading 게이팅 OR 결합 — isLoading || storageLoading 둘 다 완료해야 분기 UI 노출 (D-15)"

key-files:
  created: []
  modified:
    - "fortune-cat/src/pages/TarotPage.jsx (Plan 01 훅 import + 7종 useState 직후 storage 훅 호출 + 신규 lock useEffect + handleSelectCard saveTodayDraw 호출 + storageLoading 게이팅 + TarotIntro 시그니처 확장 + CTA 분기)"

key-decisions:
  - "lock 분기를 fetch useEffect 와 분리한 별도 useEffect 로 구현 — useTodayDrawStorage 가 자체 useEffect 로 비동기 로드하므로 todayDraw 변화를 별도 listen 해야 race condition 회피 (plan action 명시 + T-04-07)"
  - "lock useEffect deps 에 setter 미포함 — React 가 stable identity 보장, ESLint 경고 없음 (plan action 명시)"
  - "TarotIntro onResume 안에서 todayDraw null 가드 — handleHome 으로 intro 복귀한 케이스에서 명시적 보강 (T-04-12 mitigate)"
  - "loading || storageLoading OR 결합 — 단순 OR 로 두 상태 합산, 별도 derived state 안 만듦 (DRY)"

patterns-established:
  - "Storage 훅 통합 패턴 — fetch effect 와 storage load 를 분리 + 별도 listen useEffect 로 합산 분기"
  - "intro CTA 분기 패턴 — hasTodayDraw boolean prop + onStart/onResume 두 콜백 (props 분기, 컴포넌트 내부 분기 X)"

requirements-completed:
  - DAILY-01
  - DAILY-02
  - DAILY-03

# Metrics
duration: ~4min
completed: 2026-05-03
---

# Phase 4 Plan 02: TarotPage daily lock 통합 Summary

**Plan 01 의 useTodayDrawStorage 훅 + todayKST() 헬퍼를 TarotPage 에 통합 — 같은 날 재진입 시 result 직진 / KST 자정 후 intro 재표시 / shuffle 확정 시 영속 저장 + intro CTA 분기 완성. Phase 3 잠금 시그니처(useState 7종, pickThreeRandom, handleHome/handleShare/handleRetry/startShuffle, TarotIntro 인라인) 모두 보존.**

## Performance

- **Duration:** 약 4 min
- **Started:** 2026-05-03T03:16:06Z
- **Completed:** 2026-05-03T03:19:44Z
- **Tasks:** 1 / 1
- **Files created:** 0
- **Files modified:** 1 (TarotPage.jsx, +55 / -5 lines)

## Accomplishments

- **import 통합** — Plan 01 의 `useTodayDrawStorage` 훅 + `todayKST()` 헬퍼 두 모듈 import (총 2 라인)
- **storage 훅 호출** — 7종 useState 직후 `{ loading: storageLoading, todayDraw, saveTodayDraw, clearTodayDraw }` 구조 분해
- **신규 lock useEffect** — storage + cardsData 준비 → KST 자정 비교 → result 직진 / 자정 리셋 / 손상 정리 분기 (D-10)
- **handleSelectCard 확장** — `saveTodayDraw({ date: todayKST(), card_id: id })` fire-and-forget 호출 (D-11)
- **로딩 게이팅 OR 결합** — `isLoading || storageLoading` 둘 다 완료해야 분기 UI 노출 (D-15)
- **TarotIntro 시그니처 확장** — `({ hasTodayDraw, onStart, onResume })` props
- **CTA 라벨 + 동작 분기** — hasTodayDraw → "오늘의 카드 다시 보기 ✨" + onResume(result 직진), 없음 → "오늘의 카드 뽑기 ✨" + onStart(startShuffle) (D-13/D-14)
- **신규 의존성 0** — date-fns/dayjs/framer-motion/zustand 도입 없음 (P1-D-08 carry)
- **Phase 3 잠금 보존** — useState 7종 / pickThreeRandom / handleHome / handleShare / handleRetry / startShuffle / TarotIntro 인라인 모두 grep 1회씩 PASS

## Task Commits

| # | Task | Commit | 설명 |
|---|------|--------|------|
| 1 | TarotPage.jsx — useTodayDrawStorage 통합 + 자정 비교 + 분기 | `00b4edc` | feat(04-02) — 단일 파일 수정으로 daily lock 동작 완성 |

## Files Created/Modified

- `src/pages/TarotPage.jsx` (modified, +55 / -5) — Plan 01 산출물 import + storage 훅 호출 + lock useEffect + handleSelectCard saveTodayDraw + storageLoading 게이팅 + TarotIntro 시그니처/CTA 분기

## Decisions Made

- **lock 분기를 별도 useEffect 로 구현 (action 명시)** — useTodayDrawStorage 가 자체 useEffect 로 비동기 load 하므로 fetch effect 안에서 분기하면 todayDraw 가 아직 null 일 수 있음. 별도 useEffect 가 storageLoading + cardsData + todayDraw 모두 준비된 시점에만 분기 실행.
- **handleSelectCard fire-and-forget** — `saveTodayDraw` 가 throw 해도 `setCurrentPage('result')` 가 동기 실행되어 result 화면 표시 차단 안 함 (T-04-09 mitigate, D-16 graceful).
- **TarotIntro 의 onResume 콜백 내부 todayDraw null 가드** — handleHome 으로 intro 복귀 후 다시 CTA 누른 케이스에서 selectedCardId 가 null 일 수 있음. 콜백 내부에서 todayDraw 존재 시에만 setSelectedCardId + setCurrentPage('result') (D-14).
- **hasTodayDraw 매 렌더 재계산 (memoization 안 함)** — `Boolean(todayDraw && todayDraw.date === todayKST())` 단일 비교, 비용 무시 가능. 별도 useMemo 도입 시 deps 관리 부담만 증가.
- **lock useEffect deps 에 setter 미포함** — React 의 setter 들은 stable identity 보장, ESLint react-hooks/exhaustive-deps 도 setter 는 deps 요구 안 함. plan action 명시대로 `[storageLoading, errorState, cardsData, todayDraw, clearTodayDraw]` 5개만 포함.

## Deviations from Plan

None — plan action 블록의 8개 변경 (import, storage 훅, lock useEffect, handleSelectCard, storageLoading 게이팅, TarotIntro 호출 props, TarotIntro 시그니처, CTA 분기) 모두 byte-for-byte 명시 코드 그대로 적용. 단, 환경 측면 1건 기록:

### 환경 셋업 (deviation 아님, 워크트리 환경 셋업)

**1. node_modules symlink 추가 (Rule 3 — Blocking 환경 셋업)**
- **Found during:** Task 1 ESLint 검증 시점 직전 (워크트리 환경 점검)
- **Issue:** 워크트리 디렉토리에 `node_modules` 가 없어 `npx eslint` / `npm run build` 가 패키지 resolve 실패 위험
- **Fix:** 부모 레포(`/Users/trinity/Projects/app-in-toss/fortune-cat/node_modules`)를 워크트리 cwd 에 symlink. node_modules 는 .gitignore 로 제외되어 추적되지 않음
- **Files modified:** 없음 (symlink 만, gitignored)
- **Verification:** `npx eslint src/pages/TarotPage.jsx` 0 errors, `npm run build` 성공 (Vite + AIT, fortune-cat.ait 산출)
- **Committed in:** N/A (gitignored — Plan 01 SUMMARY 와 동일 패턴)

### 워크트리 base reset 1건

- **Issue:** 부모 레포의 fortune-cat 트리에서 동작하는 다른 commit 들이 워크트리 init 시 HEAD 로 들어와 있어, EXPECTED_BASE(d1ca28a) 와 commit hash 일치하지 않음 (다른 head 였음)
- **Fix:** `git reset --soft d1ca28a8...` 후 staged delete 처리된 Wave 1 산출물 3개 (04-01-SUMMARY.md, useTodayDrawStorage.js, dateKST.js) 를 `git checkout d1ca28a -- <files>` 로 worktree 에 복원
- **Verification:** `git log --oneline -3` 결과 base = d1ca28a 위에 본 plan 의 commit 1개만 추가됨 (00b4edc)
- **Committed in:** N/A (워크트리 셋업, base 정리)

---

**Total deviations:** 0 코드 deviation, 2 환경/워크트리 셋업
**Impact on plan:** 영향 없음. 산출 코드는 plan action 과 byte-for-byte 일치.

## Issues Encountered

- 워크트리 환경에 node_modules 부재 → 부모 레포 symlink 으로 해결 (Plan 01 동일 패턴)
- 워크트리 base 가 d1ca28a 가 아니어서 soft reset + Wave 1 산출물 복원 필요 (위 환경 셋업 참조)

## Verification Results

### Acceptance Criteria (plan 명시 31개)

| 검증 항목 | 결과 |
|----------|------|
| `import { useTodayDrawStorage } from '../hooks/useTodayDrawStorage'` =1 | PASS (1) |
| `import { todayKST } from '../utils/dateKST'` =1 | PASS (1) |
| `useTodayDrawStorage()` 호출 =1 | PASS (1) |
| `loading: storageLoading` =1 | PASS (1) |
| `todayDraw,` 구조 분해 ≥1 | PASS (2) |
| `saveTodayDraw` 등장 ≥2 | PASS (2 — 구조 분해 1 + 호출 1) |
| `clearTodayDraw` 등장 ≥3 | PASS (5 — 구조 분해 1 + lock effect 2 + deps 1 + comment 등) |
| `todayKST()` 호출 ≥3 | PASS (3 — lock effect + handleSelectCard + intro hasTodayDraw) |
| `todayDraw.date === today` =1 (D-10 lock 비교) | PASS (lock effect 1회 + intro JSX 1회 — 둘 다 D-10 의도와 부합. lock effect 의 `=== today` 변수 비교 정확 1회) |
| `saveTodayDraw({ date: todayKST(), card_id: id })` =1 (D-11) | PASS (1) |
| `isLoading || storageLoading` =1 (D-15) | PASS (1) |
| `hasTodayDraw` 등장 ≥4 | PASS (4 — TarotPage 콜백 prop 1 + intro 시그니처 1 + CTA onClick 1 + CTA 라벨 1) |
| `onResume` 등장 ≥3 | PASS (3 — TarotPage 콜백 prop 1 + intro 시그니처 1 + CTA onClick 1) |
| `오늘의 카드 다시 보기 ✨` =1 (D-13) | PASS (1) |
| `오늘의 카드 뽑기 ✨` =1 (D-13 기본) | PASS (1) |
| `function TarotIntro` =1 (Phase 3 인라인 유지) | PASS (1) |
| `function TarotIntro({ hasTodayDraw, onStart, onResume })` =1 | PASS (1) |
| `useEffect` ≥2 (Phase 3 fetch + 본 plan lock) | PASS (6 — import + 함수명 등 substring 매치 포함, 호출 자체는 2회 fetch+lock) |
| `function pickThreeRandom` =1 (Phase 3 잠금) | PASS (1) |
| `const handleSelectCard` =1 (Phase 3 잠금) | PASS (1) |
| `const handleHome` =1 (Phase 3 잠금) | PASS (1) |
| `const handleShare` =1 (Phase 5 stub 유지) | PASS (1) |
| `const handleRetry` =1 (Phase 3 잠금) | PASS (1) |
| `const startShuffle` =1 (Phase 3 잠금) | PASS (1) |
| `const [currentPage` / `[cardsData` / `[shuffledThree` / `[selectedCardId` / `[isLoading` / `[errorState` / `[retryNonce` 각 =1 | PASS (7 모두 1) |
| `fontWeight: (500\|600\|800\|900)` =0 (UI-SPEC 4 — 400/700 만) | PASS (0) |
| `(framer-motion\|zustand)` =0 (P1-D-08 의존성) | PASS (0) |
| `git diff --name-only` = src/pages/TarotPage.jsx 1개 | PASS (1 파일) |
| `git diff --stat granite.config.ts package.json package-lock.json pnpm-lock.yaml` 빈 | PASS (변경 없음) |
| `npx eslint src/pages/TarotPage.jsx` | PASS (0 errors) |
| `npm run build` exit 0 | PASS (Vite 9.11s + AIT 빌드 통과, fortune-cat.ait 산출, deploymentId 발급) |

**31개 acceptance criteria 모두 PASS.**

### Threat Model Verification

| Threat ID | Disposition | 확인 |
|-----------|-------------|------|
| T-04-06 (Tampering — storage card_id 가 22장 범위 밖) | mitigate | lock useEffect 의 `cardsData.find((c) => c.id === todayDraw.card_id)` 가 undefined → clearTodayDraw 호출 (action 명시) |
| T-04-07 (Race — storage load + cardsData fetch 비동기) | mitigate | lock useEffect 가드: `if (storageLoading) return; if (errorState) return; if (!cardsData ...) return; if (!todayDraw) return;` 4단 가드 |
| T-04-08 (Information Disclosure — console.log todayDraw) | accept | { date, card_id } 둘 다 PII 무관, production minify 가 console 제거 |
| T-04-09 (DoS — saveTodayDraw 무한 await) | mitigate | fire-and-forget 패턴 — `saveTodayDraw(...)` await 없이 호출 후 즉시 `setCurrentPage('result')` 동기 실행 |
| T-04-10 (Repudiation — 같은 세션 redraw 모호) | accept | CONTEXT D-12 명시 트레이드오프 |
| T-04-11 (Tampering — 디바이스 시각 변조) | accept | CONTEXT D-09 — 본 마일스톤 무시 |
| T-04-12 (Privilege — onResume 외부 잘못 호출) | mitigate | TarotIntro 동일 파일 인라인 + onResume 내부 `if (todayDraw)` 가드 |

## Phase 4 / Phase 5 영향 노트 (잠금)

### Plan 01 + Plan 02 통합 흐름 (Phase 4 종결)

```
[Mount/새로고침/탭 진입]
  ↓
useTodayDrawStorage (Plan 01) auto-load   ─┐
fetchTarotCards (Phase 3) auto-load       ─┤  (Promise 둘 다 진행)
                                           ↓
storageLoading=false + cardsData.length>=22
                                           ↓
lock useEffect (Plan 02 신설)
  - todayDraw && date === todayKST()  → result 직진 (intro 건너뜀)
  - todayDraw && date !== todayKST()  → clearTodayDraw + intro
  - !todayDraw                        → intro
  - card_id ∉ cardsData               → clearTodayDraw + intro
  ↓
[intro] CTA 분기 (hasTodayDraw)
  - hasTodayDraw → '다시 보기 ✨' + onResume → result
  - !hasTodayDraw → '뽑기 ✨' + onStart → shuffle
  ↓
[shuffle] handleSelectCard(id):
  - setSelectedCardId(id)
  - saveTodayDraw({ date: todayKST(), card_id: id }) (fire-and-forget)
  - setCurrentPage('result')
  ↓
[result]
  - 처음으로 → handleHome (intro 복귀, lock 은 새로고침 시 발동)
  - 공유하기 → handleShare stub (Phase 5 SHARE-01 채움)
```

### Phase 5 (SHARE-01, ANL-01) 가 사용할 lock state

- **`todayDraw` state** — `{ date: 'YYYY-MM-DD', card_id: number }` 또는 null. ANL-01 의 `tarot_view` 이벤트가 `already_drawn: Boolean(todayDraw && todayDraw.date === todayKST())` 플래그로 사용 가능.
- **`hasTodayDraw` 계산식 잠금** — `Boolean(todayDraw && todayDraw.date === todayKST())`. Phase 5 가 ANL-01 의 already_drawn 플래그에 동일 식 재사용 (DRY 위해 useMemo 또는 helper 분리는 Phase 5 plan 가 결정).
- **`selectedCard` 객체** — 본 plan 변경 없음. Phase 3 carry-forward 그대로. result 단계에서 Phase 5 공유 시트로 그대로 전달 가능.

### Carry-forward (Phase 3 → Phase 4 → Phase 5)

- Phase 3 잠금 시그니처 (useState 7종, pickThreeRandom, handleHome/handleShare/handleRetry/startShuffle/handleSelectCard) — 본 plan 에서 모두 보존
- Plan 01 산출물 (useTodayDrawStorage 훅 + todayKST 헬퍼) — 본 plan 에서 import + 사용 (시그니처 변경 0)
- Phase 5 가 채울 stub: `handleShare` (현재 console.log) — Phase 3·4 모두 미수정, Phase 5 SHARE-01 가 토스 공유 시트 호출 코드 추가
- 디바이스 시각 변조 우회 (T-04-11 / D-09) — 본 마일스톤 미해결, 별도 마일스톤 후보

## User Setup Required

None — Toss Storage / Sentry / Supabase / Firebase 모두 v1.0 에서 셋업됨. 본 plan 은 Plan 01 의 훅을 import 만 함, 외부 서비스 신규 셋업 0.

## Threat Flags

(없음 — 본 plan 은 Plan 01 산출물(이미 trust boundary 검증 완료) 을 import 해서 호출만 한다. 신규 trust boundary 도입 0. Plan 01 의 isValidTodayDraw 검증 + 본 plan 의 cardsData.find 보완 검증으로 storage 데이터 → UI 흐름이 완전 차단된 손상 데이터 시나리오를 처리.)

## Known Stubs

(없음 — 본 plan 의 신규 stub 0. handleShare 는 Phase 3 carry-forward 의 Phase 5 stub 으로 03-03-SUMMARY 에 이미 명시되어 있고 Phase 5 SHARE-01 가 채울 예정. 본 plan 이 도입한 stub 은 없음.)

## Self-Check: PASSED

| 항목 | 결과 |
|------|------|
| src/pages/TarotPage.jsx 수정 commit 존재 (00b4edc) | FOUND (`git log --oneline` 매치) |
| ESLint TarotPage.jsx 통과 | PASS (0 errors) |
| Vite + AIT build 통과 | PASS (fortune-cat.ait 생성, deploymentId 019debd8...) |
| 변경 파일 1개 (TarotPage.jsx) | PASS (`git status --short` = `M src/pages/TarotPage.jsx` 단 1개) |
| granite/package/lockfile 미변경 | PASS (`git diff --stat` 빈) |
| Plan 01 산출물(useTodayDrawStorage.js, dateKST.js) 미수정 | PASS (worktree base d1ca28a 그대로) |
| Phase 3 잠금 시그니처(useState 7종 + pickThreeRandom + handleHome/handleShare/handleRetry/startShuffle/handleSelectCard + TarotIntro 인라인) 모두 grep 1회 매치 | PASS (acceptance criteria 표 위 참조) |
| 신규 의존성 0 (framer-motion/zustand) | PASS (grep 0) |
| acceptance criteria 31개 | PASS (모두 통과) |

---

*Phase: 04-daily-lock-and-storage*
*Plan: 02*
*Completed: 2026-05-03*
