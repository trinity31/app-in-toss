---
phase: 04-daily-lock-and-storage
plan: 01
subsystem: storage
tags: [react-hooks, toss-storage, sentry, kst-timezone, daily-lock]

# Dependency graph
requires:
  - phase: 03-daily-one-card-core
    provides: TarotPage state machine + currentPage 라우팅 + 22장 카드 fetch
provides:
  - useTodayDrawStorage 훅 (Toss Storage 기반 todayDraw 영속 저장 — { loading, todayDraw, saveTodayDraw, clearTodayDraw })
  - todayKST() 헬퍼 (Asia/Seoul 기준 'YYYY-MM-DD' 문자열)
  - 손상 데이터 자동 정리 (isValidTodayDraw 검증 실패 → removeItem)
  - Storage 미지원 환경 graceful degradation (catch → null + loading=false)
  - Sentry 보고 패턴 (extra phase 메타) — saveTodayDraw / clearTodayDraw 실패 시
affects: [04-02 (TarotPage 통합), 05-share-and-analytics (already_drawn 플래그 활용)]

# Tech tracking
tech-stack:
  added: []  # 신규 의존성 0 (P1-D-08 carry — date-fns/dayjs 도입 금지)
  patterns:
    - "useUserInfoStorage 미러 — { loading, value, save, clear } 시그니처 + isValidXxx 검증 + try/catch + setState"
    - "console prefix [TarotStorage] — v1.0 [Storage]/[AnonymousKey] 일관"
    - "Sentry.captureException(err, { extra: { phase: 'tarot_storage_xxx' } }) — fetch/save 실패 보고 메타"
    - "graceful degradation — Storage 미지원 catch 블록에서 throw 안 함"

key-files:
  created:
    - src/utils/dateKST.js
    - src/hooks/useTodayDrawStorage.js
  modified: []

key-decisions:
  - "v1.0 useUserInfoStorage 패턴을 정확히 미러링 — DRY (CONTEXT D-04)"
  - "todayDraw 구조 = { date: 'YYYY-MM-DD', card_id: number } — card_id 만 저장, 카드 텍스트는 매 진입 시 Supabase fetch (D-03, P1-D-07 carry)"
  - "isValidTodayDraw 가 card_id 범위 0~21 검증 — 메이저 아르카나 22장 제약 (Phase 3 D-08)"
  - "todayKST() 는 새 utils/dateKST.js 로 분리 — 훅 inline 옵션 거부, Plan 02 의 TarotPage 가 별도 import 필요 (CONTEXT D-07)"
  - "JSON 파싱 실패와 isValidTodayDraw 실패를 분리해서 처리 — parseErr 별도 try/catch (정본 패턴보다 견고)"

patterns-established:
  - "Storage wrapper 훅 패턴 v2: load 실패도 graceful degradation (Storage 미지원 환경 명시 처리, D-15)"
  - "Sentry extra 메타 컨벤션: { phase: '<feature>_storage_<action>' } — 검색 인덱싱 가능한 키"

requirements-completed:
  - DAILY-01
  - DAILY-02
  - DAILY-03

# Metrics
duration: 3min
completed: 2026-05-03
---

# Phase 4 Plan 01: Storage 영속 레이어 + KST 헬퍼 Summary

**v1.0 useUserInfoStorage 패턴을 미러링한 useTodayDrawStorage 훅 + Asia/Seoul 기준 todayKST() 헬퍼 — Plan 02 TarotPage 통합용 잠금 인터페이스 완성.**

## Performance

- **Duration:** 약 3 min
- **Started:** 2026-05-03T03:09:09Z
- **Completed:** 2026-05-03T03:11:51Z
- **Tasks:** 2 / 2
- **Files created:** 2 (총 130 lines)
- **Files modified:** 0

## Accomplishments

- `useTodayDrawStorage` 훅 — Toss Storage 기반 `{ date, card_id }` 영속 저장 (mount 시 자동 load + saveTodayDraw + clearTodayDraw)
- `todayKST()` 헬퍼 — KST 기준 'YYYY-MM-DD' (en-CA locale 으로 ISO 형식 보장)
- 손상 데이터 자동 정리 (isValidTodayDraw — date 형식·card_id 범위 0~21 검증, 실패 시 removeItem)
- Storage 미지원 환경 graceful degradation (catch → todayDraw=null + loading=false, throw 안 함)
- 신규 의존성 0 — date-fns/dayjs 도입 없음 (P1-D-08 carry)
- Vite + AIT 빌드 통과 (build artifact: `fortune-cat.ait`)

## Task Commits

각 task 는 atomic 하게 커밋됨:

1. **Task 1: src/utils/dateKST.js — KST 'YYYY-MM-DD' 헬퍼** — `a77efa6` (feat)
2. **Task 2: src/hooks/useTodayDrawStorage.js — todayDraw 영속 저장 훅** — `e495135` (feat)

## Files Created/Modified

- `src/utils/dateKST.js` (신규, 11 lines) — `todayKST()` named export, Asia/Seoul 기준 ISO 날짜 헬퍼
- `src/hooks/useTodayDrawStorage.js` (신규, 119 lines) — Toss Storage wrapper 훅 + isValidTodayDraw 내부 검증 함수

## Decisions Made

- **JSON 파싱 try/catch 분리** — 정본(useUserInfoStorage)은 parse 실패와 validate 실패를 한 catch 에 묶었으나, 본 plan 에선 parseErr 를 별도 inner try 로 처리. 이유: parse 실패 시 invalid 데이터로 isValidTodayDraw 진입을 방지 (CONTEXT D-05 의 "JSON 파싱 실패" 케이스를 명시 분기). plan action 에 명시된 코드 패턴을 그대로 따름.
- **isValidTodayDraw card_id 범위 0~21 enforce** — Phase 3 D-08 (메이저 아르카나 22장) 카드 도메인 제약을 검증 레이어에서 강제. 손상/공격 케이스 모두 차단.
- **Sentry extra `phase` 메타 키** — `tarot_storage_save` / `tarot_storage_clear` 두 이벤트 분리 → Sentry 대시보드 검색 시 어느 storage action 이 실패했는지 즉시 식별 가능.

## Deviations from Plan

None — plan 이 action 블록에 정확한 코드를 명시했고 그대로 작성. 단, 환경 측면 1건 기록:

### 환경 셋업 (deviation 아님, 워크트리 환경 셋업)

**1. node_modules symlink 추가 (Rule 3 — Blocking 환경 셋업)**
- **Found during:** Task 1 ESLint 검증 시점
- **Issue:** 워크트리 디렉토리에 `node_modules` 가 없어 `npx eslint` 가 `@eslint/js` 패키지 resolve 실패
- **Fix:** 부모 레포(`/Users/trinity/Projects/app-in-toss/fortune-cat/node_modules`)를 워크트리 cwd 에 symlink. node_modules 는 .gitignore 로 제외되어 추적되지 않음
- **Files modified:** 없음 (symlink 만, gitignored)
- **Verification:** `npx eslint src/utils/dateKST.js src/hooks/useTodayDrawStorage.js` 0 errors, `npm run build` 성공 (Vite + AIT)
- **Committed in:** N/A (gitignored)

---

**Total deviations:** 0 코드 deviation, 1 환경 셋업
**Impact on plan:** 영향 없음. 산출 코드는 plan action 과 byte-for-byte 일치.

## Issues Encountered

- 워크트리 환경에 node_modules 부재 → 부모 레포 symlink 으로 해결 (위 환경 셋업 참조)

## Verification Results

| 검증 항목 | 결과 |
|----------|------|
| `test -f src/utils/dateKST.js` | PASS |
| `test -f src/hooks/useTodayDrawStorage.js` | PASS |
| `wc -l src/utils/dateKST.js` ≤ 30 | PASS (11 lines) |
| `grep -c "export function todayKST"` = 1 | PASS |
| `grep -c "export function useTodayDrawStorage"` = 1 | PASS |
| `grep -c "FORTUNE_CAT_TAROT_TODAY_DRAW"` = 1 | PASS (D-02 키 컨벤션) |
| `grep -c "Sentry.captureException"` ≥ 1 | PASS (2회 — save + clear) |
| `grep -c "phase: 'tarot_storage_save'"` = 1 | PASS (D-17) |
| `grep -c "function isValidTodayDraw"` = 1 | PASS (D-05) |
| `grep -c "Storage.removeItem"` ≥ 2 | PASS (3회 — load 손상 정리 2 + clear 1) |
| `grep -cE "JSON\\.(parse\|stringify)"` = 2 | PASS |
| `grep -c "\\[TarotStorage\\]"` ≥ 5 | PASS (12회) |
| `grep -cE "from '(date-fns\|dayjs\|moment)'"` = 0 | PASS (의존성 0) |
| `npx eslint src/utils/dateKST.js src/hooks/useTodayDrawStorage.js` | PASS (0 errors) |
| `git diff --stat package.json package-lock.json pnpm-lock.yaml` 빈 결과 | PASS (의존성 변경 없음) |
| `npm run build` (Vite + AIT) | PASS (`fortune-cat.ait` 산출) |
| `node` 런타임 todayKST() format 검증 | PASS (`'2026-05-03'`) |

## Threat Surface Coverage

| Threat ID | Disposition | 확인 |
|-----------|-------------|------|
| T-04-01 (Tampering Storage JSON) | mitigate | isValidTodayDraw 가 date regex + card_id 0~21 범위 검증, 실패 시 removeItem |
| T-04-02 (PII Sentry extra) | mitigate | extra 객체에 `phase` 키 1개만 (사용자 입력 / PII 무관) |
| T-04-03 (DoS Storage 미지원 throw) | mitigate | outer catch → todayDraw=null + loading=false, throw 안 함 |
| T-04-04 (시각 변조 자정 우회) | accept | CONTEXT D-09 — 본 마일스톤 무시 |
| T-04-05 (의존성 표면 확장) | mitigate | grep -cE 'date-fns\|dayjs\|moment' = 0 — 네이티브 Date 만 사용 |

## User Setup Required

None — 외부 서비스 설정 불필요. Toss Storage / Sentry 는 v1.0 에서 이미 셋업됨 (`useUserInfoStorage`, `useAnonymousKey` 가 동일 SDK 사용).

## Next Phase Readiness

**Plan 02 (TarotPage 통합) 가 즉시 사용 가능:**
- `import { useTodayDrawStorage } from '../hooks/useTodayDrawStorage';` — 시그니처 잠금
- `import { todayKST } from '../utils/dateKST';` — 자정 비교 유틸
- 데이터 흐름 (CONTEXT D-10):
  ```
  fetchTarotCards (Phase 3) + useTodayDrawStorage (본 plan)
    ↓
  todayDraw 존재 + todayDraw.date === todayKST() → setCurrentPage('result') (lock)
  todayDraw 존재 + date 불일치 → clearTodayDraw() + setCurrentPage('intro') (자정 리셋)
  todayDraw 없음 → setCurrentPage('intro')
  ```
- shuffle 확정 (CONTEXT D-11): `saveTodayDraw({ date: todayKST(), card_id })` fire-and-forget — 실패해도 result 화면 차단 안 함

**Blocker / 우려 사항:** 없음.

## Self-Check: PASSED

검증 결과:
- `src/utils/dateKST.js` — FOUND
- `src/hooks/useTodayDrawStorage.js` — FOUND
- 커밋 `a77efa6` (Task 1) — FOUND in `git log`
- 커밋 `e495135` (Task 2) — FOUND in `git log`
- ESLint 0 errors — VERIFIED
- Vite + AIT 빌드 성공 — VERIFIED (`fortune-cat.ait` 산출)
- 신규 의존성 0 — VERIFIED (`git diff --stat package.json` 빈 결과)

---
*Phase: 04-daily-lock-and-storage*
*Plan: 01*
*Completed: 2026-05-03*
