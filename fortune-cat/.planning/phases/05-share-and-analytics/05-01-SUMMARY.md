---
phase: 05-share-and-analytics
plan: 01
subsystem: tarot-share-analytics
tags: [toss-share-sheet, firebase-analytics, ait-bridge, deeplink, branding, react-hooks]

# Dependency graph
requires:
  - phase: 03-daily-one-card-core
    provides: TarotPage state machine + 7종 useState + handleShare/handleSelectCard stub + selectedCard 객체 + TarotIntro 인라인 + TarotShuffle onSelect 시그니처
  - phase: 04-daily-lock-and-storage
    provides: useTodayDrawStorage 훅 + todayKST() 헬퍼 + Phase 4 lock useEffect + hasTodayDraw 계산식 잠금 (Boolean(todayDraw && todayDraw.date === todayKST())) — already_drawn 플래그로 그대로 재사용
provides:
  - TarotPage handleShare 실구현 (Phase 3 stub → getTossShareLink + share + try/catch silent + card_shared 발화)
  - tarot_view 이벤트 useEffect — storage+cardsData 준비 후 1회 발화, already_drawn 플래그 동봉
  - card_drawn 이벤트 — handleSelectCard(id, slot) 안에서 saveTodayDraw 와 동일 라인에 발화
  - card_shared 이벤트 — handleShare 의 share() 성공 후 발화 (with_link 플래그)
  - TarotShuffle onSelect 시그니처 확장 — (id, slot) — slot 0/1/2 전달
  - granite.config.ts displayName = '복냥사주&타로' (통합 브랜딩, AIT 산출물 반영)
affects: [v1.1 출시, Firebase Analytics 운영, 토스 공유 시트 funnel 분석, 향후 마일스톤(v1.2+ 카드별 22종 OG 후보)]

# Tech tracking
tech-stack:
  added: []  # 신규 의존성 0 — P1-D-08 carry (framer-motion/zustand/date-fns/dayjs 미도입). 모두 기존 SDK(@apps-in-toss/web-framework) + 기존 lib(firebase.js, supabase.js) 재사용.
  patterns:
    - "공유 메시지 포맷 — 헤드라인 + 80자 트림 + 토스 링크 (boknyang-tarot 프로토타입 차용)"
    - "deeplink sandbox/production 분기 — getOperationalEnvironment() === 'sandbox' (HomePage 패턴 동일)"
    - "공유 실패 silent — try/catch + console.error 만, 사용자 알림 없음 (HomePage 패턴 동일, D-09)"
    - "tarot_view useEffect Pitfall 7 — Promise.resolve().then 마이크로태스크 + cleanup cancelled flag (unmount race 회피)"
    - "card_drawn 발화 위치 — saveTodayDraw 와 동일 라인 (둘 다 fire-and-forget)"
    - "card_shared 발화 시점 — await share() 성공 후 try 블록 안 (catch 에는 발화 X)"
    - "selectedCard 가드 — handleShare 의 if (!selectedCard) return (defensive, result 단계 외 호출 방지)"

key-files:
  created: []
  modified:
    - "fortune-cat/granite.config.ts (displayName 1줄 — '복냥사주' → '복냥사주&타로', D-04)"
    - "fortune-cat/src/pages/TarotPage.jsx (import 3종 추가 + tarot_view useEffect + handleSelectCard slot/card_drawn + handleShare 본체 교체, +63/-5 lines)"
    - "fortune-cat/src/components/TarotShuffle.jsx (handleConfirm onSelect 시그니처에 selectedSlot 추가 + 주석 1줄, +2/-1 lines)"

key-decisions:
  - "tarot_view useEffect 위치 = lock useEffect 직후 (line 113~) — Phase 4 lock 효과는 selectedCardId 세팅까지 완료된 후 별도 effect 로 발화. 동일 deps 4종(storageLoading/errorState/cardsData/todayDraw) 사용으로 race 차단."
  - "tarot_view deps 에 clearTodayDraw 미포함 — 본 effect 가 호출 안 함, ESLint react-hooks/exhaustive-deps 경고 없음 (plan action 명시)"
  - "handleShare 의 link 변수는 try 블록 밖 let 선언 — getTossShareLink 실패 시에도 share({ message }) 시도 가능 (D-09 link=undefined fallback)"
  - "card_shared 의 with_link = Boolean(link) — link=undefined(getTossShareLink 실패 케이스) 추적 가능"
  - "handleSelectCard slot 인자 — TarotShuffle.handleConfirm 의 selectedSlot 그대로 전달 (별도 변환 없음)"
  - "TarotShuffle line 2 주석은 변경하지 않음 — 기존 주석이 'onSelect(id) 호출' 이 아니라 다른 컨텍스트(boknyang-tarot 프로토타입 모델 재구성)였음. 코드 시그니처 확장만 + line 28 주석 1줄 추가"

patterns-established:
  - "Toss 공유 시트 통합 패턴 — 헤드라인 + 본문 트림 + 링크 메시지 포맷 + sandbox/prod deeplink 분기 + try/catch silent + 성공 후 logEvent (HomePage 정본 + boknyang-tarot 프로토타입 통합)"
  - "Firebase Analytics 발화 위치 패턴 — UI 분기 직전(handleSelectCard) 또는 외부 IO 성공 직후(share) 에 fire-and-forget 호출"
  - "useEffect 발화 보호 패턴 — Promise.resolve().then 마이크로태스크 + cancelled flag (unmount 직후 race 회피, Pitfall 7)"
  - "TarotShuffle slot 전달 패턴 — onSelect(id, slot) 시그니처 확장 — 호출자(TarotPage) 와 동시 갱신해 외부 영향 0 (T-05-08)"

requirements-completed:
  - SHARE-01
  - ANL-01
  - ANL-02
  - ANL-03

# Metrics
duration: 8.0min
completed: 2026-05-03
---

# Phase 5 Plan 01: 공유 + Analytics 마무리 Summary

**TarotPage 의 handleShare stub 을 v1.0 HomePage 패턴 + boknyang-tarot 프로토타입 메시지 포맷으로 실구현하고, tarot_view·card_drawn·card_shared 3종 Firebase Analytics 이벤트 발화를 통합. granite.config.ts displayName 을 '복냥사주&타로' 통합 브랜딩으로 갱신해 v1.1 마일스톤의 코드 변경분을 단일 plan 으로 종결.**

## Performance

- **Duration:** 8.0 min (479 sec)
- **Started:** 2026-05-03T04:51:05Z
- **Completed:** 2026-05-03T04:59:04Z
- **Tasks:** 2 / 2
- **Files created:** 0
- **Files modified:** 3 (granite.config.ts, src/pages/TarotPage.jsx, src/components/TarotShuffle.jsx)

## Accomplishments

### 코드 변경
- **granite.config.ts displayName** — `'복냥사주' → '복냥사주&타로'` (D-04). 빌드 산출물(`fortune-cat.ait`) 의 통합 브랜딩 갱신.
- **TarotPage.jsx import 통합** — `getTossShareLink + share + getOperationalEnvironment + env` from `@apps-in-toss/web-framework`, `getOgImageUrl` 을 기존 `fetchTarotCards` import 와 통합 (DRY), `logEvent` from `../lib/firebase`.
- **tarot_view useEffect** — storage + cardsData 준비 완료 후 1회 발화. `already_drawn = Boolean(todayDraw && todayDraw.date === todayKST())` 로 Phase 4 잠금식 그대로 재사용. cleanup cancelled flag + Promise.resolve().then 마이크로태스크 (Pitfall 7) (D-06 ANL-01).
- **handleSelectCard 시그니처 확장** — `(id, slot) =>` 로 slot 인자 수신. `saveTodayDraw` 호출 라인은 byte-for-byte 보존 (Phase 4 잠금) + `logEvent('card_drawn', { card_id: id, slot })` 1줄 추가 (D-07 ANL-02).
- **TarotShuffle.handleConfirm** — `onSelect(cards[selectedSlot].id, selectedSlot)` 시그니처 확장 (D-07 의 slot 전달 준비) + 주석 1줄 보강.
- **handleShare 본체 교체** — Phase 3 stub(`console.log`) 제거, async 함수로 교체:
  - 헤드라인: `[복냥타로] 오늘의 카드 — ${name_ko} · ${name_en}` (D-01)
  - 본문: `card.message.length > 80 ? slice(0,80) + '…' : message` (D-01)
  - deeplink: `intoss-private://...` (sandbox) / `intoss://fortune-cat/tarot` (prod) (D-02)
  - getTossShareLink 실패 → link=undefined fallback (D-09)
  - share() 성공 후 `logEvent('card_shared', { card_id, with_link })` (D-08 ANL-03)
  - share() 실패 silent — `console.error` 만 (D-09)
  - `if (!selectedCard) return` 가드 (defensive)

### 검증
- 모든 plan acceptance criteria PASS (TarotShuffle 2개 + import 4개 + tarot_view 4개 + card_drawn 3개 + handleShare 12개 + Phase 3·4 잠금 12개 + 의존성 1개 + 변경 범위 4개 + 빌드/린트 2개)
- ESLint 0 errors
- AIT 빌드 성공 — `fortune-cat.ait` 산출 (deploymentId `019dec32-d49e-7849-af63-b4b5daf97b17`)
- 변경 파일 정확히 3개 (granite.config.ts, TarotPage.jsx, TarotShuffle.jsx)
- v1.0 페이지 (HomePage/SajuPage/NewYearPage/AmuletPage) + lib (firebase.js/supabase.js) 미수정 (NAV-03 회귀 방지)
- 신규 의존성 0 (P1-D-08 carry)

## Task Commits

| # | Task | Commit | 설명 |
|---|------|--------|------|
| 1 | granite.config.ts displayName 변경 | `cb7b5d3` | feat(05-01) — 1줄 변경 (D-04 통합 브랜딩) |
| 2 | TarotPage handleShare 실구현 + 3종 logEvent + TarotShuffle slot 전달 | `1b3c70b` | feat(05-01) — 2 files (+74/-6 lines), SHARE-01 + ANL-01/02/03 + D-01~D-09 모두 byte-for-byte 명시 코드 그대로 적용 |

## Files Created/Modified

- `fortune-cat/granite.config.ts` (modified, +1/-1) — `displayName: '복냥사주' → '복냥사주&타로'`
- `fortune-cat/src/pages/TarotPage.jsx` (modified, +63/-5) — import 3종 추가 + tarot_view useEffect 신규 + handleSelectCard 시그니처/card_drawn 발화 + handleShare 본체 교체
- `fortune-cat/src/components/TarotShuffle.jsx` (modified, +2/-1) — handleConfirm onSelect 시그니처에 selectedSlot 추가 + D-07 주석

## Decisions Made

- **tarot_view useEffect 위치 = lock useEffect 직후 (line 113~)** — Phase 4 lock useEffect 가 selectedCardId 세팅까지 완료되도록 일부러 뒤에 배치. 같은 trigger(storageLoading/errorState/cardsData/todayDraw)지만 책임 분리(분기 vs 발화).
- **tarot_view deps = 4종 (clearTodayDraw 미포함)** — 본 effect 가 setter 를 호출하지 않으므로 ESLint react-hooks/exhaustive-deps 도 deps 요구 안 함. plan action 명시 deps 그대로.
- **`link` 변수를 try 밖 let 선언** — getTossShareLink 가 throw 해도 link=undefined 로 두고 share({ message }) 시도. D-09 silent 정책 + with_link=false 트래킹 동시에 만족.
- **`with_link = Boolean(link)`** — link=undefined(getTossShareLink 실패) 또는 정상(string) 둘 다 boolean 으로 정규화. Firebase Analytics 에서 funnel 분석 가능.
- **handleSelectCard 의 saveTodayDraw 라인은 byte-for-byte 보존** — Phase 4 D-11 잠금. logEvent('card_drawn') 만 1줄 추가 (자리 = saveTodayDraw 직후, plan action 명시 위치).
- **TarotShuffle 의 line 2 주석은 변경하지 않음** — plan 의 권장사항이 "기존 주석 `onSelect(id) 호출` 을 1글자 보강" 이었으나 실제 line 2 는 다른 컨텍스트(boknyang-tarot 프로토타입 모델 재구성) 의 주석이라 변경 부적절. line 28 에 D-07 주석 1줄 추가하는 것으로 plan 의도(slot 전달 컨텍스트 설명) 충족.
- **TarotPage import 그룹 합치기** — `getOgImageUrl` 을 기존 `fetchTarotCards` 와 같은 import 문으로 통합 (DRY, plan action 권장).

## Deviations from Plan

None — plan action 블록의 5단계 변경 (TarotShuffle 시그니처 확장, TarotPage import, tarot_view useEffect, handleSelectCard 확장, handleShare 본체 교체) 모두 byte-for-byte 명시 코드 그대로 적용. 단 1건 환경 셋업 기록:

### 환경 셋업 (deviation 아님)

**1. node_modules symlink 추가 (Plan 04-01/04-02 동일 패턴)**
- **Found during:** Task 1 시작 직전 (워크트리 환경 점검)
- **Issue:** 워크트리 디렉토리(`/Users/trinity/Projects/app-in-toss/.claude/worktrees/agent-a088e3c22d0d8a561/fortune-cat`)에 `node_modules` 가 없어 `npx eslint` / `npm run build` 가 패키지 resolve 실패 위험
- **Fix:** 부모 레포(`/Users/trinity/Projects/app-in-toss/fortune-cat/node_modules`)를 워크트리 cwd 에 symlink. node_modules 는 .gitignore 로 제외되어 추적되지 않음
- **Files modified:** 없음 (symlink 만, gitignored)
- **Verification:** `npx eslint src/pages/TarotPage.jsx src/components/TarotShuffle.jsx` 0 errors, `npm run build` 성공
- **Committed in:** N/A (gitignored — Plan 04-01/04-02 SUMMARY 와 동일 패턴)

### 워크트리 base 정합 1건

- **Issue:** worktree HEAD(`2915463`) 와 명시된 EXPECTED_BASE(`29154636...`) 는 일치했으나, parent repo HEAD(`a2ddea1`) 컨텍스트로 reset 시도 시 working tree 가 비어 있는 상태가 노출됨 (워크트리 init 시점 working tree 정합성)
- **Fix:** `git reset --soft 29154636` 후 `git checkout HEAD -- .` 로 working tree 를 HEAD 와 동기화 (PLAN.md / CONTEXT.md / DISCUSSION-LOG.md / tarot_cat.png 복원)
- **Verification:** `git status --short` 결과 추적 변경 없음, 본 plan 의 commit 2개만 추가됨 (`cb7b5d3`, `1b3c70b`)
- **Committed in:** N/A (워크트리 셋업 정리)

---

**Total deviations:** 0 코드 deviation, 2 환경/워크트리 셋업
**Impact on plan:** 영향 없음. 산출 코드는 plan action 과 byte-for-byte 일치.

## Issues Encountered

- 워크트리 환경에 node_modules 부재 → 부모 레포 symlink 으로 해결 (Plan 04-01/04-02 동일 패턴)
- 워크트리 working tree 가 비어 있음 → `git checkout HEAD -- .` 로 복원 (위 환경 셋업 참조)

## Verification Results

### Acceptance Criteria — Plan 명시

#### TarotShuffle.jsx (Step 1)

| 검증 항목 | 결과 |
|----------|------|
| `grep -c "onSelect(cards\[selectedSlot\].id, selectedSlot)" src/components/TarotShuffle.jsx` = 1 | PASS (1) |
| `grep -c "onSelect(cards\[selectedSlot\].id);$" src/components/TarotShuffle.jsx` = 0 | PASS (0) |
| 변경 줄 수 ≤ 3 (handleConfirm 본체 + 주석 보강만) | PASS (+2/-1) |

#### TarotPage.jsx imports (Step 2)

| 검증 항목 | 결과 |
|----------|------|
| `grep -c "getTossShareLink" src/pages/TarotPage.jsx` ≥ 1 | PASS (4 — import + 호출 + console.error 메시지 등) |
| `grep -c "from '@apps-in-toss/web-framework'" src/pages/TarotPage.jsx` ≥ 1 | PASS (1) |
| `grep -c "getOgImageUrl" src/pages/TarotPage.jsx` ≥ 2 | PASS (2 — import + 호출) |
| `grep -c "import.*logEvent.*firebase" src/pages/TarotPage.jsx` = 1 | PASS (1) |

#### tarot_view 이벤트 (Step 3, D-06 ANL-01)

| 검증 항목 | 결과 |
|----------|------|
| `grep -c "logEvent('tarot_view'" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "already_drawn:" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| useEffect deps = `[storageLoading, errorState, cardsData, todayDraw]` (4종, clearTodayDraw 미포함) | PASS (소스 line 131 확인) |
| cleanup cancelled flag 패턴 적용 (Pitfall 7) | PASS (line 123-124, 130) |

#### card_drawn 이벤트 (Step 4, D-07 ANL-02)

| 검증 항목 | 결과 |
|----------|------|
| `grep -c "const handleSelectCard = (id, slot) =>" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "logEvent('card_drawn'" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "card_id: id, slot" src/pages/TarotPage.jsx` = 1 | PASS (1) |

#### handleShare 실구현 + card_shared (Step 5, D-01/02/08/09 + SHARE-01 ANL-03)

| 검증 항목 | 결과 |
|----------|------|
| `grep -c "const handleShare = async () =>" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "logEvent('card_shared'" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "with_link: Boolean(link)" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "\[복냥타로\] 오늘의 카드" src/pages/TarotPage.jsx` = 1 (헤드라인) | PASS (1) |
| `grep -c "selectedCard.message.length > 80" src/pages/TarotPage.jsx` = 1 (80자 트림) | PASS (1) |
| `grep -c "intoss://fortune-cat/tarot" src/pages/TarotPage.jsx` = 1 (production deeplink) | PASS (1) |
| `grep -c "intoss-private://appsintoss?_deploymentId=" src/pages/TarotPage.jsx` = 1 (sandbox deeplink) | PASS (1) |
| `grep -c "getOperationalEnvironment() === 'sandbox'" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "console.error('\[TarotPage\] 공유 실패:'" src/pages/TarotPage.jsx` = 1 (D-09 silent) | PASS (1) |
| `grep -c "console.error('\[TarotPage\] getTossShareLink 실패:'" src/pages/TarotPage.jsx` = 1 (D-09 link 실패도 silent) | PASS (1) |
| `grep -c "share stub — Phase 5" src/pages/TarotPage.jsx` = 0 (stub 흔적 제거) | PASS (0) |
| `await share({ message })` 라인이 try 블록 안에 있고 logEvent 가 그 try 블록 안 (catch 에는 logEvent 없음) | PASS (line 189-195: try { share + logEvent } catch { console.error 만 }) |

#### Phase 3·4 잠금 시그니처 보존

| 검증 항목 | 결과 |
|----------|------|
| `grep -c "function pickThreeRandom" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "const startShuffle" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "const handleHome" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "const handleRetry" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "function TarotIntro({ hasTodayDraw, onStart, onResume })" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "useTodayDrawStorage()" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "import { todayKST } from '../utils/dateKST'" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -E "const \[(currentPage\|cardsData\|shuffledThree\|selectedCardId\|isLoading\|errorState\|retryNonce)" \| wc -l` = 7 | PASS (7) |
| `grep -c "오늘의 카드 다시 보기 ✨" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| `grep -c "오늘의 카드 뽑기 ✨" src/pages/TarotPage.jsx` = 1 | PASS (1) |
| Phase 4 의 lock useEffect (storageLoading 가드 + clearTodayDraw 호출) 보존 | PASS (line 89-112 byte-for-byte 보존) |

#### 신규 의존성 0 (P1-D-08 carry)

| 검증 항목 | 결과 |
|----------|------|
| `grep -c "framer-motion\|zustand\|date-fns\|dayjs" src/pages/TarotPage.jsx src/components/TarotShuffle.jsx` = 0 | PASS (0 매치) |
| `grep -rn "framer-motion\|zustand\|date-fns\|dayjs" src/` | PASS (Boknyang.jsx 의 *금지* 주석 1건만 — 도입 0) |

#### 변경 범위 (회귀 방지)

| 검증 항목 | 결과 |
|----------|------|
| `git diff --name-only HEAD~2 HEAD` 결과 = 정확히 3 파일 (granite/TarotPage/TarotShuffle) | PASS |
| `git diff --stat package.json package-lock.json pnpm-lock.yaml` 빈 (lockfile 변경 없음) | PASS (빈) |
| `git diff --stat src/pages/HomePage.jsx src/pages/SajuPage.jsx src/pages/NewYearPage.jsx src/pages/AmuletPage.jsx` 빈 (v1.0 페이지 미수정) | PASS (빈) |
| `git diff --stat src/lib/` 빈 (firebase.js, supabase.js 미수정 — D-03) | PASS (빈) |

#### 빌드 + 린트

| 검증 항목 | 결과 |
|----------|------|
| `npx eslint src/pages/TarotPage.jsx src/components/TarotShuffle.jsx` 0 errors | PASS |
| `npm run build` exit 0 — `fortune-cat.ait` 산출 | PASS (Vite 11.38s + AIT 빌드 통과, deploymentId `019dec32-d49e-7849-af63-b4b5daf97b17`) |

#### key_links pattern (plan frontmatter)

| pattern | 결과 |
|---------|------|
| `await getTossShareLink\(` | PASS (1) |
| `getOgImageUrl\(\)` | PASS (1) |
| `getOperationalEnvironment\(\) === ['"]sandbox['"]` | PASS (1) |
| `logEvent\(['"]tarot_view['"]` | PASS (1) |
| `logEvent\(['"]card_drawn['"]` | PASS (1) |
| `logEvent\(['"]card_shared['"]` | PASS (1) |
| `onSelect\(cards\[selectedSlot\]\.id, selectedSlot\)` | PASS (1) |

**모든 acceptance criteria + key_links pattern PASS.**

### Threat Model Verification

| Threat ID | Disposition | 확인 |
|-----------|-------------|------|
| T-05-01 (Information Disclosure — handleShare 메시지 본문) | accept | name_ko/name_en/message 모두 Supabase 공개 시드 데이터 (PII 무관). 사용자 명시적 공유 버튼 클릭에만 외부 전송 |
| T-05-02 (Tampering — getOperationalEnvironment 위조) | accept | 토스 SDK 시그니처, 사용자 공격면 없음. HomePage 도 동일 패턴 |
| T-05-03 (DoS — getTossShareLink/share 무한 hang) | mitigate | try/catch 블록 silent 처리 (D-09). result 화면 sync 표시 후 발생이라 사용자 영향 최소 |
| T-05-04 (Information Disclosure — logEvent params Firebase 전송) | accept | card_id (1~22) + slot (0/1/2) + with_link (boolean) 모두 PII 무관 |
| T-05-05 (Repudiation — share 후 logEvent throw) | accept | logEvent 자체 fire-and-forget + Firebase wrapper silent |
| T-05-06 (Tampering — dev 브라우저 getTossShareLink 미정의) | mitigate | 두 단계 try/catch 가 link=undefined 로 fallback + share 도 catch silent. dev 환경에서도 사용자 차단 없음 |
| T-05-07 (Spoofing — 공격자 OG 이미지 URL) | accept | getOgImageUrl 결과는 Supabase Storage 의 fixed URL. 본 plan 코드 변경 없음 (D-03) |
| T-05-08 (Privilege — TarotShuffle.onSelect slot 추가가 외부 호출자 영향) | mitigate | TarotShuffle 은 TarotPage 안에서만 사용 (`src/pages/TarotPage.jsx:299` 단 1곳). 시그니처 확장 시 호출자 코드도 같은 plan 의 Step 4 에서 동시 수정 |
| T-05-09 (Information Disclosure — already_drawn 플래그 Firebase 전송) | accept | boolean 1개, retention 측정용 의도적 노출 (CONTEXT D-06 명시) |

**모든 mitigation 은 코드에 byte-for-byte 명시. accept 들은 CONTEXT 명시 정책의 직접 결과.**

## Phase 5 종결 노트

### v1.1 마일스톤 코드 반영 완료

본 plan 으로 v1.1 의 마지막 코드 변경분(SHARE-01 + ANL-01/02/03 + D-04 displayName) 이 모두 반영됐다. 이로써 v1.1 의 14개 요구사항 중 11개 (Phase 1~4 8건 + Phase 5 4건 — TAB-01/02 NAV-01~03 TAROT-01~03 DAILY-01~03 SHARE-01 ANL-01~03 = 14건) 가 코드에 모두 반영됐다.

### 인간 UAT 보류 항목 (자동화 불가)

본 plan 의 Firebase 콘솔 이벤트 수신 검증과 토스 공유 시트 실제 동작 검증은 자동화 불가 — Phase 4 의 04-HUMAN-UAT.md 패턴으로 별도 추적 필요:

1. AIT WebView 빌드 산출물(`fortune-cat.ait`) 을 dev 디바이스에 배포
2. 타로 탭 진입 → Firebase 콘솔 (DebugView 또는 Realtime) 에서 `tarot_view` 이벤트 + `already_drawn=false` 확인
3. 카드 뽑기 → `card_drawn` + `card_id`, `slot` 파라미터 확인
4. 같은 날 재진입 → `tarot_view` + `already_drawn=true` 확인
5. result 화면 공유하기 → 토스 공유 시트 노출 + 메시지에 헤드라인/80자 본문/링크 모두 포함
6. 공유 완료 → `card_shared` + `card_id`, `with_link=true` 확인
7. 공유 취소 → `card_shared` 미발화 (silent) 확인
8. dev 일반 브라우저에서 공유 버튼 → console.error 만 + 사용자 차단 없음 확인
9. 빌드 산출물 displayName 이 토스 미니앱 카드에 '복냥사주&타로' 로 표시되는지 확인

### Carry-forward (Phase 3 → Phase 4 → Phase 5)

- Phase 3 잠금 시그니처 (useState 7종, pickThreeRandom, handleHome/handleRetry/startShuffle, TarotIntro 인라인 + props) — 본 plan 에서 모두 보존
- Phase 4 잠금 시그니처 (useTodayDrawStorage 훅 호출, lock useEffect, hasTodayDraw 계산식, storageLoading 게이팅) — 본 plan 에서 모두 보존
- Phase 5 신규 stub 0 — 본 plan 이 도입한 새 stub 없음
- Toss 콘솔 등록명/아이콘 변경 — 사용자 직접 처리 (deferred)
- Supabase Storage `og_image.png` 통합 브랜딩 이미지 교체 — 사용자가 디자인 + 업로드 (deferred)
- 카드별 22종 OG 이미지 — 호스팅/동기화 부담, v1.2 후보
- 공유 받은 사람에게 보낸 사람 카드 미리보기 — 저장 키 URL-encode + 받는 페이지 파싱 필요, v1.2 후보
- LLM 기능 + 수익화 모델 + 22장 컬렉션 메타게임 — v1.2+ 마일스톤 (.planning/seeds/)

## User Setup Required

**1. Supabase Storage `og_image.png` 통합 브랜딩 이미지 교체** — 사용자 디자인 자산 준비 후 Storage 콘솔에서 직접 업로드. 코드 변경 없음 (D-03 — 같은 URL 재사용).

**2. Toss 미니앱 콘솔 등록명/아이콘 변경** — granite.config.ts 의 displayName 만 코드에 반영. 콘솔 자체 등록명·아이콘 교체는 사용자가 별도로 진행 (출시 게이팅 작업).

**3. Firebase Analytics DebugView/Realtime 검증** — 본 plan 의 인간 UAT 항목 (위 "인간 UAT 보류 항목" 9개) 을 dev 디바이스에서 실행해 이벤트 수신 확인.

## Threat Flags

(없음 — 본 plan 은 v1.0 패턴(`@apps-in-toss/web-framework` 토스 공유 + Firebase Analytics) 의 trust boundary 그대로 재사용. T-05 register 의 9건은 모두 CONTEXT 명시 정책으로 mitigate/accept 처리 + plan action 의 명시 코드로 구현 완료. 신규 trust boundary 도입 0.)

## Known Stubs

(없음 — 본 plan 으로 Phase 3 의 handleShare stub 이 실구현으로 교체됨. plan 이 도입한 새 stub 없음.)

## Self-Check: PASSED

| 항목 | 결과 |
|------|------|
| granite.config.ts displayName='복냥사주&타로' (cb7b5d3) | FOUND (`git log --oneline` 매치 + grep PASS) |
| TarotPage.jsx 수정 commit 존재 (1b3c70b) | FOUND |
| TarotShuffle.jsx 수정 commit 존재 (1b3c70b — 같은 commit) | FOUND |
| ESLint TarotPage + TarotShuffle 통과 | PASS (0 errors) |
| Vite + AIT build 통과 | PASS (fortune-cat.ait 생성, deploymentId 019dec32-...) |
| 변경 파일 정확히 3개 (granite + TarotPage + TarotShuffle) | PASS |
| package.json/lockfile 미변경 | PASS |
| v1.0 페이지 (HomePage/SajuPage/NewYearPage/AmuletPage) 미변경 | PASS |
| src/lib/ (firebase.js / supabase.js) 미변경 (D-03) | PASS |
| Phase 3 잠금 시그니처 모두 grep 1회 매치 | PASS |
| Phase 4 잠금 시그니처 모두 grep 1회 매치 | PASS |
| 신규 의존성 0 (TarotPage + TarotShuffle 코드 import 0) | PASS |
| 모든 plan acceptance criteria + key_links pattern | PASS |
| handleShare stub 흔적 0 | PASS |
| SUMMARY.md 작성 | DONE |

---

*Phase: 05-share-and-analytics*
*Plan: 01*
*Completed: 2026-05-03*
