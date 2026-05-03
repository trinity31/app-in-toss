---
phase: 04-daily-lock-and-storage
verified: 2026-05-03T00:00:00Z
status: human_needed
score: 8/8 must-haves 자동 검증 통과 (행동 검증은 디바이스 필요)
overrides_applied: 0
re_verification:
  previous_status: none
  previous_score: N/A
  gaps_closed: []
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "DAILY-01 — 같은 날 재진입 lock"
    expected: "토스 인앱(AIT WebView)에서 카드 1장을 뽑은 후 앱을 종료하고 다시 타로 탭에 진입 → intro/shuffle 단계 건너뛰고 즉시 result 화면이 표시된다 (같은 카드)"
    why_human: "Toss Storage API 는 AIT WebView 안에서만 동작하므로 실제 디바이스에서만 영속성 검증 가능"
  - test: "DAILY-02 — KST 자정 리셋"
    expected: "디바이스 날짜를 다음날로 변경한 뒤 타로 탭에 다시 진입 → intro 화면이 다시 표시되고, CTA 라벨이 '오늘의 카드 뽑기 ✨' 로 노출된다"
    why_human: "디바이스 시각 변경 + 진입 → state 머신 분기 분기는 실제 환경에서만 검증 가능"
  - test: "DAILY-03 — 새로고침 / 앱 재시작 영속성"
    expected: "카드 1장 뽑은 후 페이지를 새로고침(또는 앱 재시작) → 즉시 result 화면 직진 (같은 카드, 같은 해석)"
    why_human: "Toss Storage 영속성은 실제 AIT WebView 에서만 동작"
  - test: "Graceful degradation — 일반 브라우저 (Storage 미지원)"
    expected: "npm run dev 로 일반 브라우저에서 진입 → throw 없이 intro 정상 노출, 카드 뽑기 → result 정상 동작 (메모리 기반, lock 미발동, 새로고침 시 다시 intro 가능)"
    why_human: "Storage 미지원 catch 블록의 graceful degradation 은 실제 브라우저 실행으로 확인 필요"
  - test: "intro CTA 라벨 분기 (D-13)"
    expected: "result 에서 '처음으로(handleHome)' → intro 진입 시 CTA 라벨이 '오늘의 카드 다시 보기 ✨' 로 자동 변경되어 표시된다"
    why_human: "hasTodayDraw 분기는 storage 와 todayKST 가 모두 동작하는 환경에서만 시각 검증 가능"
  - test: "intro Resume 동작 (D-14)"
    expected: "위 상태에서 CTA 탭 → shuffle 단계를 거치지 않고 result 직진 (저장된 카드 표시)"
    why_human: "onResume 콜백 동작은 디바이스에서 실제 탭 입력으로만 검증 가능"
  - test: "NAV-03 v1.0 회귀 방지"
    expected: "사주 / 신년운세 / 부적 / 딥리딩 4개 흐름 모두 v1.0 동작 그대로 유지된다 (라우팅, 결제, 광고 등 미영향)"
    why_human: "v1.0 페이지 회귀 검증은 실제 사용자 흐름 수행으로만 확인 가능"
  - test: "손상 데이터 graceful degradation (자동 복구)"
    expected: "DevTools 로 Toss Storage(또는 localStorage 폴백) 의 FORTUNE_CAT_TAROT_TODAY_DRAW 값을 'invalid_json' 또는 {date:'bad', card_id:99} 로 변조 → 새로고침 → 손상 데이터 자동 정리 + intro 정상 노출"
    why_human: "실제 storage 변조 + 자동 정리 동작은 디바이스/브라우저에서만 검증 가능"
---

# Phase 4: 데일리 lock + 영속 저장 + 자정 리셋 — Verification Report

**Phase Goal:** 사용자가 카드를 뽑으면 그날 카드가 KST 자정까지 lock 되어 같은 날 재진입 시 같은 결과 화면이 표시되고, 자정에 lock 이 해제되어 새 카드를 뽑을 수 있다. 저장은 앱 재시작·새로고침에도 유지된다.
**Verified:** 2026-05-03T00:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria + PLAN must_haves 통합)

| #   | Truth | Status | Evidence |
| --- | ----- | ------ | -------- |
| 1   | 같은 날(KST 자정 전) 재진입 시 그날 뽑은 카드의 결과 화면이 표시된다 (intro/shuffle 건너뜀) [SC-1, DAILY-01] | VERIFIED (코드) / HUMAN (동작) | TarotPage.jsx:82-105 의 lock useEffect 가 `todayDraw.date === today` 일 때 `setSelectedCardId(todayDraw.card_id)` + `setCurrentPage('result')` 직진 분기 구현. 실제 동작은 AIT WebView 디바이스 검증 필요 |
| 2   | KST 자정(00:00) 이후 진입 시 새 intro 단계가 다시 표시된다 [SC-2, DAILY-02] | VERIFIED (코드) / HUMAN (동작) | TarotPage.jsx:100-104 의 `else` 분기가 date 불일치 시 `clearTodayDraw()` 호출 → `currentPage='intro'` 유지. todayKST() 가 Asia/Seoul 시간대 ISO 8601 보장 (dateKST.js:9-11) |
| 3   | 앱 재시작·페이지 새로고침해도 그날 뽑은 카드가 유지된다 [SC-3, DAILY-03] | VERIFIED (코드) / HUMAN (동작) | useTodayDrawStorage.js:34-73 의 mount 시 `Storage.getItem(FORTUNE_CAT_TAROT_TODAY_DRAW)` 자동 호출 + isValidTodayDraw 검증 + setTodayDraw. handleSelectCard:114-120 에서 saveTodayDraw 호출로 영속화. 실제 영속성은 AIT WebView 검증 필요 |
| 4   | 저장 데이터 손상·미존재 케이스에서도 graceful degradation (intro fallback) [SC-4] | VERIFIED | useTodayDrawStorage.js:48-60 (JSON 파싱 실패 + isValidTodayDraw 실패) 모두 `Storage.removeItem` + `setTodayDraw(null)` + `return null`. 추가로 lock useEffect 의 cardsData.find undefined 케이스도 clearTodayDraw 호출 (TarotPage.jsx:95-99) |
| 5   | useTodayDrawStorage 훅이 `{ loading, todayDraw, saveTodayDraw, clearTodayDraw }` 시그니처를 노출한다 | VERIFIED | useTodayDrawStorage.js:113-118 정확히 4개 키 반환 |
| 6   | todayKST() 가 KST(Asia/Seoul) 기준 'YYYY-MM-DD' 문자열을 반환한다 | VERIFIED | dateKST.js:9-11 — `toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })`. Node 런타임 검증 결과 `2026-05-03` (정상) |
| 7   | Storage 미지원 환경에서도 훅이 throw 하지 않고 graceful degradation 한다 (D-15) | VERIFIED (코드) / HUMAN (동작) | useTodayDrawStorage.js:65-72 outer catch 블록이 `setTodayDraw(null)` + `setLoading(false)` 후 throw 안 함. 일반 브라우저 실행 검증 필요 |
| 8   | saveTodayDraw 실패 시 Sentry.captureException 보고 + UI 차단 안 함 (D-16/D-17) | VERIFIED | useTodayDrawStorage.js:89-94 — try/catch 안에서 `Sentry.captureException(error, { extra: { phase: 'tarot_storage_save' } })` + `return false`. handleSelectCard 에서 await 없이 fire-and-forget 호출 (TarotPage.jsx:118) |

**Score:** 8/8 must-haves 자동 검증 통과. 4개 항목(#1, #2, #3, #7)은 실제 동작 검증을 위해 디바이스/브라우저 인간 검증 필요.

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `src/utils/dateKST.js` | KST 'YYYY-MM-DD' 헬퍼, ≥8 lines, exports `todayKST` | VERIFIED | 11 lines, `export function todayKST` 1회, Asia/Seoul + en-CA + toLocaleDateString 1회씩, 외부 의존성 0 |
| `src/hooks/useTodayDrawStorage.js` | Toss Storage wrapper 훅, ≥80 lines, exports `useTodayDrawStorage` | VERIFIED | 119 lines, FORTUNE_CAT_TAROT_TODAY_DRAW 키 1회, isValidTodayDraw 검증, Storage.getItem/setItem/removeItem 모두 호출 |
| `src/pages/TarotPage.jsx` | intro/shuffle/result 3단계 + daily lock 통합, ≥250 lines | VERIFIED | 324 lines, useTodayDrawStorage 통합, lock useEffect 신설, handleSelectCard 안 saveTodayDraw 호출, intro CTA 분기 모두 구현 |

### Key Link Verification

| From | To | Via | Status | Details |
| ---- | -- | --- | ------ | ------- |
| useTodayDrawStorage.js | @apps-in-toss/web-framework Storage | Storage.getItem/setItem/removeItem | WIRED | Storage.getItem 1회, Storage.setItem 1회, Storage.removeItem 3회 호출 (load 손상 정리 2 + clear 1) |
| useTodayDrawStorage.js | @sentry/react | Sentry.captureException | WIRED | 2회 호출 (saveTodayDraw 실패 + clearTodayDraw 실패), extra `phase: 'tarot_storage_save\|clear'` 메타 포함 |
| TarotPage.jsx | useTodayDrawStorage.js | import + 훅 호출 | WIRED | line 21 import + line 46 `useTodayDrawStorage()` 구조 분해 |
| TarotPage.jsx | dateKST.js | import + todayKST() 호출 | WIRED | line 22 import + 3회 호출 (lock effect:88, handleSelectCard:118, intro CTA prop:219) |
| TarotPage useEffect | loadTodayDraw + 자정 비교 + 분기 | lock useEffect | WIRED | TarotPage.jsx:82-105 — 4단 가드 (storageLoading/errorState/cardsData/todayDraw) → date 비교 → result 직진 / clearTodayDraw 분기 |
| handleSelectCard | saveTodayDraw | shuffle 확정 시 fire-and-forget | WIRED | TarotPage.jsx:118 — `saveTodayDraw({ date: todayKST(), card_id: id })` await 없이 호출 후 `setCurrentPage('result')` 동기 실행 |
| TarotIntro | hasTodayDraw / onResume / onStart 분기 | props 분기 | WIRED | line 218-229 props 전달 + 243 시그니처 + 296 onClick 분기 + 316 라벨 분기 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| TarotPage.jsx | `todayDraw` | useTodayDrawStorage 훅 → Storage.getItem → JSON.parse → isValidTodayDraw | YES (Toss Storage 영속 데이터) | FLOWING (디바이스 동작 검증 별도) |
| TarotPage.jsx | `selectedCard` | cardsData.find(c => c.id === selectedCardId), selectedCardId ← todayDraw.card_id (lock effect) 또는 사용자 탭 입력 (handleSelectCard) | YES (Phase 3 fetchTarotCards 데이터) | FLOWING |
| TarotIntro | `hasTodayDraw` | `Boolean(todayDraw && todayDraw.date === todayKST())` 매 렌더 재계산 | YES (todayDraw 와 todayKST() 실시간 결합) | FLOWING |
| TarotResult | `card`, `onHome`, `onShare` | TarotPage selectedCard / handleHome / handleShare | YES (handleShare 는 Phase 3 carry-forward stub, Phase 5 SHARE-01 가 채움) | FLOWING (handleShare stub 은 PLAN 명시 — Phase 4 책임 외) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| todayKST() 형식 검증 | `node -e "const r = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' }); /^\d{4}-\d{2}-\d{2}$/.test(r)"` | `2026-05-03` (PASS) | PASS |
| ESLint Phase 4 파일 3개 | `npx eslint src/utils/dateKST.js src/hooks/useTodayDrawStorage.js src/pages/TarotPage.jsx` | 0 errors (출력 없음) | PASS |
| import 시그니처 (TarotPage) | `grep -n "import.*useTodayDrawStorage\|import.*todayKST" src/pages/TarotPage.jsx` | 21:useTodayDrawStorage / 22:todayKST | PASS |
| storage 키 컨벤션 | `grep -c "FORTUNE_CAT_TAROT_TODAY_DRAW" src/hooks/useTodayDrawStorage.js` | 1 (D-02 컨벤션) | PASS |
| Sentry 보고 횟수 | `grep -c "Sentry.captureException" src/hooks/useTodayDrawStorage.js` | 2 (save + clear) | PASS |
| 신규 의존성 미도입 | `grep -cE "(framer-motion\|zustand\|date-fns\|dayjs\|moment)" 3개 파일` | 0 (P1-D-08 carry) | PASS |
| 잠금 시그니처 호출 | `grep -c "useTodayDrawStorage()"` | 1 | PASS |
| 자정 비교식 | `grep -cE "todayDraw\.date === today"` | 2 (lock effect 1 + intro JSX hasTodayDraw 1) | PASS |
| 저장 fire-and-forget 패턴 | `grep -cE "saveTodayDraw\(\{ date: todayKST\(\), card_id: id \}\)"` | 1 (D-11) | PASS |
| 인프라 미변경 | `git diff package.json package-lock.json pnpm-lock.yaml granite.config.ts` | 빈 결과 | PASS |
| 디바이스 영속성 (DAILY-01/02/03) | N/A (AIT WebView 필요) | SKIP — 디바이스 환경 부재 | SKIP → human_verification 으로 라우팅 |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| DAILY-01 | 04-01-PLAN, 04-02-PLAN | 같은 날(KST 자정 전) 재진입 시 그날 뽑은 카드 결과 화면 표시 | SATISFIED (코드) / NEEDS HUMAN (동작) | TarotPage lock useEffect (line 82-105) `todayDraw.date === today` 분기로 result 직진. 실제 영속성 동작은 AIT WebView 디바이스 검증 필요 |
| DAILY-02 | 04-01-PLAN, 04-02-PLAN | KST 자정 이후 새 카드 뽑기 가능 (lock 해제) | SATISFIED (코드) / NEEDS HUMAN (동작) | lock useEffect else 분기 + clearTodayDraw 호출. todayKST() 가 Asia/Seoul 기준 ISO 8601 보장 |
| DAILY-03 | 04-01-PLAN, 04-02-PLAN | 앱 재시작·새로고침에도 todayDraw 유지 | SATISFIED (코드) / NEEDS HUMAN (동작) | useTodayDrawStorage 훅이 mount 시 Storage.getItem 자동 호출 + handleSelectCard 안 saveTodayDraw 호출 |

**ROADMAP Phase 4 Coverage:** 3/3 (DAILY-01, DAILY-02, DAILY-03) — orphaned requirements 0건. 모든 DAILY 요구사항이 04-01-PLAN 와 04-02-PLAN 양쪽 frontmatter 의 `requirements` 에 명시되어 추적된다.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| useTodayDrawStorage.js | 38, 62, 77, 86 | 정상 흐름 console.log 4건 | INFO | vite.config terser 가 production 에서 console 제거. 기능 영향 없음. v1.0 [Storage] 패턴 일관 (REVIEW IN-01) |
| useTodayDrawStorage.js | 15 | `card_id < 0 \|\| card_id > 21` hard-coded | INFO | 시드 변경 시(마이너 아르카나 추가) 수동 동기 필요. 현재 v1.1 메이저 22장 기준 정확 (REVIEW IN-02) |
| useTodayDrawStorage.js | 50, 57 | removeItem + setTodayDraw(null) + return null 블록 2회 중복 | INFO | DRY 위반 (헬퍼 추출 권장). 기능 영향 없음 (REVIEW IN-03) |
| useTodayDrawStorage.js | 65-72 | loadTodayDraw outer catch 가 Sentry 보고 누락 | WARNING | D-15 graceful 의도지만 진짜 native bridge 장애도 같이 묻힘. 일관성 깨짐 (REVIEW WR-01) — 본 페이즈 책임 범위 내이나 동작에는 영향 없음, 모니터링 후 후속 페이즈에서 보강 |
| TarotPage.jsx | 82-105 | lock useEffect deps 에 currentPage 미포함 (의도) | WARNING | handleHome 후 자동 result 복귀 안 됨 — onResume 버튼에 의존. 의도된 설계, 주석 명시. Phase 5 가 currentPage 추가 시 race 위험 (REVIEW WR-02) |
| TarotPage.jsx:131-133 | handleShare console.log only | Phase 3 carry-forward stub (Phase 5 SHARE-01 책임) | INFO | Phase 4 책임 범위 외 — 변경 금지 항목 |

**Critical(blocker) 0건. Warning 2건은 production ship-ready, 모니터링 보강 후보.**

### Human Verification Required

자동 코드 검증은 모두 통과했으나, **다음 항목들은 실제 디바이스(토스 인앱 AIT WebView) 또는 브라우저 동작 검증이 필요합니다.** Toss Storage API 가 AIT WebView 안에서만 동작하기 때문에 영속성·자정 리셋·graceful degradation 등 핵심 동작은 자동 검증 불가능합니다.

#### 1. DAILY-01 — 같은 날 재진입 lock

**Test:** 토스 인앱에서 카드 1장을 뽑은 후 앱 종료 → 다시 진입 → 타로 탭
**Expected:** intro/shuffle 단계 건너뛰고 즉시 result 화면이 표시된다 (같은 카드)
**Why human:** Toss Storage API 는 AIT WebView 안에서만 동작

#### 2. DAILY-02 — KST 자정 리셋

**Test:** 디바이스 날짜를 다음날로 변경 → 타로 탭에 다시 진입
**Expected:** intro 화면이 다시 표시되고 CTA 라벨이 "오늘의 카드 뽑기 ✨" 로 노출
**Why human:** 디바이스 시각 변경 + 진입 → state 머신 분기는 실제 환경에서만 검증 가능

#### 3. DAILY-03 — 새로고침 / 앱 재시작 영속성

**Test:** 카드 1장 뽑은 후 새로고침(또는 앱 재시작) → 타로 탭 진입
**Expected:** 즉시 result 화면 직진 (같은 카드, 같은 해석)
**Why human:** Toss Storage 영속성은 실제 AIT WebView 에서만 동작

#### 4. Graceful degradation — 일반 브라우저 (Storage 미지원)

**Test:** `npm run dev` → 일반 브라우저에서 진입 → 카드 뽑기 흐름 수행
**Expected:** throw 없이 intro 정상 노출, 카드 뽑기 → result 정상 동작 (메모리 기반, lock 미발동, 새로고침 시 다시 intro)
**Why human:** Storage 미지원 catch 블록은 실제 브라우저 실행으로 확인

#### 5. intro CTA 라벨 분기 (D-13)

**Test:** result 에서 "처음으로(handleHome)" → intro 진입
**Expected:** CTA 라벨이 "오늘의 카드 다시 보기 ✨" 로 자동 변경되어 표시
**Why human:** hasTodayDraw 분기는 storage 와 todayKST 가 모두 동작하는 환경에서만 검증

#### 6. intro Resume 동작 (D-14)

**Test:** 위 #5 상태에서 CTA 탭
**Expected:** shuffle 단계를 거치지 않고 result 직진 (저장된 카드 표시)
**Why human:** onResume 콜백 동작은 디바이스에서 실제 탭 입력으로만 검증

#### 7. NAV-03 v1.0 회귀 방지

**Test:** 사주 / 신년운세 / 부적 / 딥리딩 4개 흐름 모두 수행
**Expected:** v1.0 동작 그대로 유지 (라우팅, 결제, 광고 등 미영향)
**Why human:** v1.0 페이지 회귀 검증은 실제 사용자 흐름으로만 확인

#### 8. 손상 데이터 graceful degradation (자동 복구)

**Test:** DevTools 로 storage 의 `FORTUNE_CAT_TAROT_TODAY_DRAW` 값을 'invalid_json' 또는 `{date:'bad', card_id:99}` 로 변조 → 새로고침
**Expected:** 손상 데이터 자동 정리(removeItem) + intro 정상 노출 (앱 차단 없음)
**Why human:** 실제 storage 변조 + 자동 정리 동작은 디바이스/브라우저에서만 검증

### Gaps Summary

**자동 검증 결과 모든 must-have(8/8) 와 ROADMAP Success Criteria(4/4) 가 코드 레벨에서 만족됨.** Phase 4 산출물 3개 파일(`dateKST.js`, `useTodayDrawStorage.js`, `TarotPage.jsx`) 모두 substantive + wired + data-flowing 상태이며 ESLint 통과, 신규 의존성 0, 인프라 미변경(`granite.config.ts` / `package.json` / lockfile 모두 무변경) 확인 완료.

요구사항 DAILY-01/02/03 모두 PLAN frontmatter 에 명시되어 두 plan 모두에서 실제 코드 evidence 와 매핑됨. orphaned requirements 0건.

코드 리뷰 발견 사항(REVIEW WR-01/WR-02 + IN-01~05)은 production ship-ready 수준의 마이너 개선 후보로 본 페이즈 goal 차단 요인이 아니며, 모니터링 후 후속 페이즈(또는 v1.2)에서 보강 후보입니다.

**다만 Phase 4 의 핵심 동작 검증(daily lock 영속성, 자정 리셋, graceful degradation)은 Toss Storage API 가 AIT WebView 안에서만 동작하므로 실제 디바이스 검증이 필수입니다.** 위 8개 인간 검증 시나리오 통과 후 Phase 5 진행 권장.

---

_Verified: 2026-05-03T00:00:00Z_
_Verifier: Claude (gsd-verifier)_
