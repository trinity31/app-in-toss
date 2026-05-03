---
phase: 05-share-and-analytics
verified: 2026-05-03T00:00:00Z
status: human_needed
score: 8/8 must-haves 자동 검증 완료
overrides_applied: 0
human_verification:
  - test: "AIT WebView 디바이스에서 타로 탭 진입 → Firebase 콘솔 (DebugView/Realtime) 에서 tarot_view 이벤트 + already_drawn=false 수신 확인"
    expected: "Firebase 콘솔에 tarot_view 이벤트가 already_drawn=false 파라미터와 함께 수신됨"
    why_human: "Firebase 실시간 콘솔 수신은 자동화 불가 + AIT WebView 빌드 산출물 디바이스 배포 필요"
  - test: "AIT WebView 디바이스에서 카드 1장 뽑기 → Firebase 콘솔에서 card_drawn 이벤트 + card_id (1~22) + slot (0/1/2) 수신 확인"
    expected: "Firebase 콘솔에 card_drawn 이벤트가 card_id, slot 파라미터와 함께 수신됨"
    why_human: "Firebase 실시간 콘솔 수신 + 디바이스 인터랙션 필요"
  - test: "같은 날 재진입 → Firebase 콘솔에서 tarot_view + already_drawn=true 확인 (WR-01 fix 검증: 한 마운트 1회만 발화)"
    expected: "tarot_view 이벤트가 already_drawn=true 로 1회만 발화됨 (saveTodayDraw 후 todayDraw reference 변경에 의한 중복 발화 없음)"
    why_human: "Firebase DebugView 에서 이벤트 횟수 카운트는 자동화 불가"
  - test: "result 화면에서 공유하기 버튼 → 토스 공유 시트가 노출되고 메시지에 헤드라인 + 80자 본문 + 토스 링크 모두 포함됨"
    expected: "토스 공유 시트가 노출되고 메시지에 '[복냥타로] 오늘의 카드 — {name_ko} · {name_en}' + 80자 트림된 본문 + getTossShareLink 결과 URL 포함"
    why_human: "토스 공유 시트는 AIT WebView 안에서만 동작 — 디바이스 검증 필수"
  - test: "공유 완료 → Firebase 콘솔에서 card_shared + card_id + with_link=true 수신"
    expected: "Firebase 콘솔에 card_shared 이벤트가 card_id, with_link=true 파라미터와 함께 수신됨"
    why_human: "share API 는 AIT WebView 전용 + Firebase 콘솔 수신 검증 필요"
  - test: "공유 시트에서 사용자가 취소 → card_shared 이벤트 미발화 확인 (catch 블록 silent 검증)"
    expected: "사용자가 공유를 취소하면 card_shared 이벤트가 발화되지 않고 console.error 만 남음 (사용자 알림 없음, HomePage silent 패턴 동일)"
    why_human: "사용자 취소 분기 + Firebase 미발화 확인은 디바이스 검증 필수"
  - test: "dev 일반 브라우저 (AIT WebView 외)에서 공유 버튼 → console.error 만 남고 사용자 차단 없음"
    expected: "getTossShareLink/share 가 throw 해도 try/catch silent — 페이지 정상 표시 유지, 사용자 알림 없음"
    why_human: "일반 브라우저 dev 환경 graceful degradation 검증 — REVIEW WR-02 (typeof 가드 미적용) 동작 영향 확인 필요"
  - test: "AIT 빌드 산출물 (fortune-cat.ait) 의 displayName 이 토스 미니앱 카드/리스트에 '복냥사주&타로' 로 표시됨"
    expected: "토스 미니앱 카드에 '복냥사주&타로' 한글명 노출 (구 '복냥사주' 흔적 없음)"
    why_human: "토스 미니앱 콘솔 노출은 디바이스 + 콘솔 검증"
  - test: "v1.0 사주/딥리딩/부적/신년운세 흐름이 본 phase 변경 후에도 동일하게 동작 (NAV-03 회귀 방지)"
    expected: "HomePage 공유 버튼, SajuPage 사주 흐름, NewYearPage 딥리딩, AmuletPage 인앱결제 모두 v1.0 동일 동작"
    why_human: "회귀 테스트는 디바이스 또는 dev 환경에서 직접 흐름 실행 검증"
---

# Phase 5: 공유 + Analytics 마무리 Verification Report

**Phase Goal:** 사용자가 데일리 원카드 결과를 토스 공유 시트로 외부에 공유할 수 있고, 타로 탭 진입·카드 뽑기·공유 3종 이벤트가 Firebase Analytics에 기록되어 v1.1 출시 준비가 완료된다
**Verified:** 2026-05-03
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth | Status     | Evidence |
| --- | ----- | ---------- | -------- |
| 1   | SHARE-01 — 사용자가 result 화면 공유 버튼 클릭 시 토스 공유 시트가 열려 카드 헤드라인 + 80자 본문 + 토스 링크가 외부 공유됨 | VERIFIED (코드) / HUMAN_NEEDED (디바이스) | `src/pages/TarotPage.jsx:160-197` handleShare async 본체 + `TarotResult.jsx:216` onClick={onShare} + `TarotPage.jsx:299` onShare={handleShare} wiring 완료 |
| 2   | D-02 sandbox/prod deeplink 분기 — sandbox 는 `intoss-private://appsintoss?_deploymentId=...` / prod 는 `intoss://fortune-cat/tarot` | VERIFIED | `TarotPage.jsx:172-175` `getOperationalEnvironment() === 'sandbox'` 분기 + 두 deeplink 모두 grep 1회 매치 |
| 3   | D-09 공유 실패 silent — 토스트/알림 없이 console.error 만 (HomePage 패턴 동일) | VERIFIED | `TarotPage.jsx:177-180` getTossShareLink catch + `TarotPage.jsx:193-196` share catch — 둘 다 console.error 만 (사용자 알림 0) |
| 4   | ANL-01 — 타로 탭 진입 시 Firebase Analytics 에 tarot_view 이벤트가 already_drawn 플래그와 함께 마운트당 1회 기록됨 | VERIFIED (코드) / HUMAN_NEEDED (Firebase 콘솔) | `TarotPage.jsx:118-128` useEffect + `tarotViewLoggedRef` 가드 (REVIEW WR-01 fix) + `logEvent('tarot_view', { already_drawn })` |
| 5   | ANL-02 — 카드 뽑기 시 Firebase Analytics 에 card_drawn 이벤트가 card_id + slot 으로 기록됨 | VERIFIED (코드) / HUMAN_NEEDED (Firebase 콘솔) | `TarotPage.jsx:137-145` `handleSelectCard(id, slot)` + `logEvent('card_drawn', { card_id: id, slot })` + `TarotShuffle.jsx:29` `onSelect(cards[selectedSlot].id, selectedSlot)` slot 전달 |
| 6   | ANL-03 — 결과 공유 시 Firebase Analytics 에 card_shared 이벤트가 card_id + with_link 와 함께 기록됨 | VERIFIED (코드) / HUMAN_NEEDED (Firebase 콘솔) | `TarotPage.jsx:186-192` await share 성공 후 try 블록 안에서 `logEvent('card_shared', { card_id, with_link: Boolean(link) })` (catch 에는 미발화) |
| 7   | D-04 앱 displayName = '복냥사주&타로' — 빌드 산출물 통합 브랜딩 반영 | VERIFIED (코드) / HUMAN_NEEDED (토스 콘솔 노출) | `granite.config.ts:6` `displayName: '복냥사주&타로'` (구 '복냥사주' 흔적 0) |
| 8   | Phase 3·4 잠금 시그니처 보존 + v1.0 페이지/lib 무영향 (NAV-03 회귀 방지) | VERIFIED | useState 7종 grep 매치, useTodayDrawStorage(), pickThreeRandom, TarotIntro 시그니처, lock useEffect 모두 보존. v1.0 페이지/lib 미수정 (`git diff --stat` 빈) |

**Score:** 8/8 truths 코드 자동 검증 PASS — 5/8 truths 는 디바이스/콘솔 인간 검증 필요

### Required Artifacts

| Artifact | Expected | Status | Details |
| -------- | -------- | ------ | ------- |
| `granite.config.ts` | displayName '복냥사주&타로' | VERIFIED | line 6 매치 (`grep -c "displayName: '복냥사주&타로'"` = 1) |
| `src/pages/TarotPage.jsx` | handleShare 실구현 + 3종 logEvent + slot 인자 수신 | VERIFIED | 395줄 (min_lines 280 충족), `getTossShareLink` 호출 1, 3종 `logEvent` 모두 매치, `handleSelectCard(id, slot)` 시그니처 매치 |
| `src/components/TarotShuffle.jsx` | onSelect(id, slot) 시그니처 확장 | VERIFIED | line 29 `onSelect(cards[selectedSlot].id, selectedSlot)` 매치 |

### Key Link Verification

| From | To  | Via | Status | Details |
| ---- | --- | --- | ------ | ------- |
| TarotPage.handleShare | @apps-in-toss/web-framework `getTossShareLink + share` | AIT bridge | VERIFIED | `TarotPage.jsx:176` `await getTossShareLink(deepLink, getOgImageUrl())` + `TarotPage.jsx:187` `await share({ message })` |
| TarotPage.handleShare | src/lib/supabase.js `getOgImageUrl` | OG 이미지 URL 조회 | VERIFIED | `TarotPage.jsx:21` import + `TarotPage.jsx:176` 호출. `src/lib/supabase.js` 코드 변경 0 (D-03 충족) |
| TarotPage.handleShare | @apps-in-toss/web-framework `getOperationalEnvironment + env` | sandbox/prod deeplink 분기 | VERIFIED | `TarotPage.jsx:172` `getOperationalEnvironment() === 'sandbox'` + `env.getDeploymentId()` 사용 |
| TarotPage useEffect | src/lib/firebase.js `logEvent` | tarot_view 마운트당 1회 | VERIFIED | `TarotPage.jsx:127` `logEvent('tarot_view', { already_drawn })` + `tarotViewLoggedRef.current` 가드 (WR-01 fix) |
| TarotPage.handleSelectCard | src/lib/firebase.js `logEvent` | card_drawn — card_id + slot | VERIFIED | `TarotPage.jsx:143` `logEvent('card_drawn', { card_id: id, slot })` |
| TarotPage.handleShare | src/lib/firebase.js `logEvent` | card_shared — share 성공 후 card_id + with_link | VERIFIED | `TarotPage.jsx:189-192` try 블록 안에서 `logEvent('card_shared', { card_id, with_link: Boolean(link) })` (catch 미발화) |
| TarotShuffle.handleConfirm | TarotPage.handleSelectCard | onSelect(id, slot) 시그니처 | VERIFIED | `TarotShuffle.jsx:29` `onSelect(cards[selectedSlot].id, selectedSlot)` + `TarotPage.jsx:296` `onSelect={handleSelectCard}` |
| TarotResult onShare | TarotPage.handleShare | result 화면 공유 버튼 | VERIFIED | `TarotPage.jsx:299` `<TarotResult card={selectedCard} onHome={handleHome} onShare={handleShare} />` + `TarotResult.jsx:216` onClick={onShare} |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| -------- | ------------- | ------ | ------------------ | ------ |
| TarotPage.handleShare | `selectedCard` | `cardsData.find((c) => c.id === selectedCardId)` (line 203-205) — Phase 3 의 `fetchTarotCards()` Supabase fetch 결과 | YES (Phase 3 fetch + Phase 4 lock 영속) | FLOWING |
| TarotPage tarot_view useEffect | `todayDraw` | `useTodayDrawStorage()` 훅 — Phase 4 영속 저장 (Toss Storage / localStorage) | YES (Phase 4 영속) | FLOWING |
| TarotPage.handleSelectCard | `id, slot` props | TarotShuffle 의 `selectedSlot` state + `cards[selectedSlot].id` (Phase 3 pickThreeRandom 결과) | YES (실 셔플 결과) | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| -------- | ------- | ------ | ------ |
| TarotPage handleShare 본체에 stub 흔적 0 | `grep -c "share stub" src/pages/TarotPage.jsx` | 0 | PASS |
| TarotPage 의 logEvent 3종 모두 매치 | `grep -E "logEvent\('(tarot_view\|card_drawn\|card_shared)'" src/pages/TarotPage.jsx \| wc -l` | 3 | PASS |
| TarotShuffle onSelect 시그니처 확장 매치 | `grep -c "onSelect(cards\[selectedSlot\].id, selectedSlot)" src/components/TarotShuffle.jsx` | 1 | PASS |
| granite displayName 통합 브랜딩 매치 | `grep -c "displayName: '복냥사주&타로'" granite.config.ts` | 1 | PASS |
| Phase 3·4 잠금 — useState 7종 보존 | `grep -E "const \[(currentPage\|cardsData\|shuffledThree\|selectedCardId\|isLoading\|errorState\|retryNonce)" src/pages/TarotPage.jsx \| wc -l` | 7 | PASS |
| 신규 의존성 0 (P1-D-08 carry) | `grep -c "framer-motion\|zustand\|date-fns\|dayjs" src/pages/TarotPage.jsx src/components/TarotShuffle.jsx` | 0 (둘 다) | PASS |
| WR-01 fix — useRef 가드 적용 | `grep -c "tarotViewLoggedRef" src/pages/TarotPage.jsx` | 4 (선언+가드+set+useRef import) | PASS |
| Firebase 콘솔 실제 이벤트 수신 | (Firebase DebugView 실측) | n/a | SKIP (인간 UAT) |
| 토스 공유 시트 실제 노출 | (AIT WebView 디바이스) | n/a | SKIP (인간 UAT) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| ----------- | ----------- | ----------- | ------ | -------- |
| SHARE-01 | 05-01-PLAN.md | 사용자가 데일리 원카드 결과를 토스 공유 시트로 외부 공유 | SATISFIED (코드) / NEEDS HUMAN (디바이스) | TarotPage.handleShare 실구현 + TarotResult.onShare wiring 완료 |
| ANL-01 | 05-01-PLAN.md | 타로 탭 진입 시 tarot_view 이벤트 + already_drawn 플래그 기록 | SATISFIED (코드) / NEEDS HUMAN (Firebase 콘솔) | TarotPage 의 useEffect (line 119-128) + tarotViewLoggedRef 가드 (WR-01 fix) |
| ANL-02 | 05-01-PLAN.md | 카드 뽑기 시 card_drawn 이벤트 + card_id 기록 | SATISFIED (코드) / NEEDS HUMAN (Firebase 콘솔) | handleSelectCard(id, slot) + logEvent('card_drawn', { card_id, slot }) + TarotShuffle slot 시그니처 확장 |
| ANL-03 | 05-01-PLAN.md | 공유 시 card_shared 이벤트 기록 | SATISFIED (코드) / NEEDS HUMAN (Firebase 콘솔) | share() 성공 후 try 블록 안 logEvent('card_shared', { card_id, with_link }) (catch 에 미발화) |

**Orphaned requirements:** None — REQUIREMENTS.md 의 Phase 5 mapping 4건 (SHARE-01, ANL-01, ANL-02, ANL-03) 모두 plan frontmatter requirements 와 일치.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| ---- | ---- | ------- | -------- | ------ |
| src/pages/TarotPage.jsx | 22-23 | `// eslint-disable-next-line no-unused-vars -- getCardImageUrl는 plan acceptance criteria에 명시된 import` | INFO | REVIEW IN-03 — Phase 5 종료 후 cleanup 후보. 본 phase 의 잠금 의도 (TarotShuffle/TarotResult 가 직접 사용하는 import 시그니처 잠금) 의 잔재. 동작 영향 0. |
| src/pages/TarotPage.jsx | 160-197 | handleShare 가 selectedCard 선언 (line 203) 보다 위에서 정의됨 | INFO | REVIEW IN-01 — JS 클로저로 정상 동작. 가독성만 영향. |
| src/pages/TarotPage.jsx | 137-145 | handleSelectCard 의 slot 파라미터 타입 가드 부재 | INFO | REVIEW IN-02 — 현재 호출처(TarotShuffle.handleConfirm)에 selectedSlot !== null 가드 있어 안전. 향후 호출처 추가 시 분석 신호 손실 가능. |
| src/pages/TarotPage.jsx | 160-197 | `typeof getTossShareLink === 'function'` 가드 누락 | WARNING (REVIEW WR-02 미해결) | dev 일반 브라우저에서 share API 미존재 시 try/catch silent 로 잡히지만 console.error 노이즈 + Sentry breadcrumb 누적 가능성. **사용자 차단 없음** — D-09 silent 정책 동작은 정상. 인간 UAT 항목 7번에서 별도 검증. |

**Stub 흔적:** 0 (`grep -c "share stub"` = 0 — Phase 3 stub 완전 교체)

### Human Verification Required

상세 항목은 frontmatter `human_verification:` 9건 참조.

핵심 검증 영역:
1. **Firebase 실시간 이벤트 수신** — DebugView 또는 Realtime 콘솔에서 tarot_view (already_drawn=false/true) + card_drawn (card_id, slot) + card_shared (card_id, with_link=true) 모두 확인
2. **토스 공유 시트 실제 노출** — AIT WebView 디바이스에서 result 화면 공유 버튼 → 시트 노출 + 메시지 포맷 확인
3. **WR-01 fix 검증** — 한 마운트 안에서 카드 뽑기 후 saveTodayDraw 직후 tarot_view 가 중복 발화되지 않음을 DebugView 횟수로 확인
4. **dev 브라우저 graceful degradation** — share API 미지원 환경에서 console.error 만 + 사용자 차단 없음
5. **displayName 토스 미니앱 카드 노출** — '복냥사주&타로' 한글명이 토스 콘솔 등록 후 사용자에게 노출
6. **NAV-03 회귀 방지** — v1.0 사주/딥리딩/부적/신년운세 흐름 무영향 확인

### Gaps Summary

**자동 검증 영역에는 gap 없음.** Plan 의 9개 D-XX 결정 + 4개 요구사항 (SHARE-01, ANL-01/02/03) + WR-01 fix 모두 코드에 byte-for-byte 적용. Phase 3·4 잠금 시그니처 모두 보존 + v1.0 페이지/lib 미수정 (NAV-03 회귀 방지) + 신규 의존성 0.

**REVIEW WR-02 (typeof 가드 미적용)** 은 동작 영향 없는 Warning — D-09 silent 정책 (try/catch 만으로 사용자 차단 없음) 으로 dev 브라우저에서도 정상 fallback. 인간 UAT 항목 7번에서 별도 확인.

**Status = human_needed 사유:** Toss SDK (`getTossShareLink`, `share`) 와 Firebase Analytics 이벤트 수신은 AIT WebView 전용 + 외부 콘솔 검증 — 자동화 불가. 9건의 인간 UAT 항목을 통과해야 v1.1 출시 준비 완료.

---

_Verified: 2026-05-03_
_Verifier: Claude (gsd-verifier)_
