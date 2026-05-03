# Phase 04: 데일리 lock + 영속 저장 + 자정 리셋 - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning
**Source:** v1.1 수익 모델 전환 결정 + 대화 누적 결정 (광고 무제한 → daily-lock 무료)

<domain>
## Phase Boundary

사용자가 카드를 뽑으면 그날 카드가 KST 자정까지 lock 되어 같은 날 재진입 시 같은 결과 화면이 표시되고, 자정에 lock 이 해제되어 새 카드를 뽑을 수 있다. 저장은 앱 재시작·새로고침에도 유지된다.

**책임:**
- Toss Storage 기반 todayDraw 영속 저장 ({ date, card_id } 구조)
- TarotPage 진입 시 storage 로드 + 자정 비교 + 분기
- shuffle 확정 시 todayDraw 즉시 저장 (메모리 + storage)
- intro CTA 라벨 분기 (todayDraw 존재 → "다시 보기", 없음 → "뽑기")
- graceful degradation (Storage 미지원/실패 시 메모리 fallback)
- 회귀 방지 (v1.0 사주/딥리딩/부적 흐름 무영향)

**책임 외 (다른 페이즈):**
- 토스 공유 시트 연결 (Phase 5 SHARE-01)
- Firebase Analytics 이벤트 — `tarot_view` 의 `already_drawn` 플래그도 (Phase 5 ANL-01 가 storage state 활용)

</domain>

<decisions>
## Implementation Decisions

### Storage Layer

- **D-01: Toss `Storage` 사용** (`@apps-in-toss/web-framework`). v1.0 `useUserInfoStorage`/`useAnonymousKey`/`usePendingOrderStorage` 패턴 동일하게 미러링. 신규 의존성 0 (P1-D-08 carry-forward).
- **D-02: 저장 키 = `FORTUNE_CAT_TAROT_TODAY_DRAW`** (v1.0 `FORTUNE_CAT_USER_INFO` 컨벤션 일관). 대문자 + UNDERSCORE.
- **D-03: 저장 데이터 구조 = `{ date: 'YYYY-MM-DD', card_id: number }` JSON 직렬화**. card_id 만 저장 (전체 cards 는 매 진입 시 Supabase fetch — Phase 3 와 동일). date 는 KST 기준 ISO 날짜.
- **D-04: 신규 훅 `useTodayDrawStorage`** (`src/hooks/useTodayDrawStorage.js`) — `useUserInfoStorage` 시그니처 미러. `{ loading, todayDraw, saveTodayDraw, clearTodayDraw }` 반환.
- **D-05: 손상된 데이터 정리** — JSON 파싱 실패, date 누락, card_id 누락, date 형식 오류 → `Storage.removeItem` 후 null 반환. v1.0 `isValidUserInfo` 패턴 재현.

### Date / Timezone

- **D-06: KST(`Asia/Seoul`) 기준 자정** — 디바이스 timezone 무관. 모든 사용자가 한국 자정에 일괄 리셋. 한국 사용자 대상 앱이라 단순화 우선.
- **D-07: today date 산정 = `new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })` → `YYYY-MM-DD`**. en-CA locale 이 ISO 형식을 보장.
- **D-08: 자정 리셋 검사 시점 = intro 마운트 직후 1회**. `setInterval` 사용 안 함. 사용자가 자정 직전에 진입한 후 자정 지나면, 다음 진입(새로고침 또는 탭 재진입)에 lock 해제됨. 실시간 reactive lock 안 함.
- **D-09: 디바이스 시각 변경으로 자정 우회 가능** — 본 마일스톤에선 무시. 서버 시각 검증은 별도 마일스톤 후보.

### TarotPage 통합

- **D-10: 진입 흐름 분기** — TarotPage useEffect (Phase 3 의 fetch effect 확장):
  1. cardsData fetch (Phase 3 그대로)
  2. todayDraw storage 로드
  3. todayDraw 존재 + `todayDraw.date === todayKST()` → `setSelectedCardId(todayDraw.card_id)` + `setCurrentPage('result')` (intro 건너뛰고 result 직진)
  4. todayDraw 미존재 또는 date 불일치 → `setCurrentPage('intro')` 유지 (기본)
  5. date 불일치 시 `clearTodayDraw()` 자동 호출 (자정 리셋 동작)
- **D-11: shuffle 확정 시 저장 흐름** — `handleSelectCard(id)` 안에서 `setSelectedCardId(id)` 직후 `saveTodayDraw({ date: todayKST(), card_id: id })` 호출. 저장 실패해도 result 화면은 그대로 표시 (메모리 fallback). `setCurrentPage('result')` 는 동기 동작 — storage save 의 await 가 result 진입을 막지 않음.
- **D-12: handleHome 동작 유지** — `setSelectedCardId(null)` + `setShuffledThree([])` + `setCurrentPage('intro')`. lock 은 다음 진입(새로고침)에 발동. 같은 세션 내 처음으로 → 다시 뽑기 시도 시 useEffect 재실행 안 되므로 새 카드 뽑기 가능 (자연스러움).
  - 단, 사용자가 의도적으로 새 카드를 원하면 새로고침 = result 로 튕김 (lock 작동). 이게 daily one-card 정책.
  - **트레이드오프 인지:** 같은 세션 내 redraw 가 가능해 보이지만 새로고침하면 묶임. Phase 5 또는 v1.2 에서 일관성 강화 가능.

### intro UI 분기

- **D-13: intro CTA 라벨 분기** — todayDraw 존재 시 "오늘의 카드 다시 보기 ✨", 없을 때 "오늘의 카드 뽑기 ✨" (프로토타입 home 패턴). intro 화면을 보여줄 일은 처음으로 누른 사용자뿐이므로 시각 일관성 위해.
- **D-14: intro CTA 동작 분기** — todayDraw 존재 시 즉시 result 진입 (`setCurrentPage('result')`), 없을 때 기존 startShuffle 호출.

### Graceful Degradation

- **D-15: Storage 미지원 환경 (일반 브라우저, dev 미러 등)** — `Storage.getItem` 호출이 throw 또는 undefined 반환. try/catch 로 감싸 lock 없이 동작 (Phase 3 의 in-memory only 흐름과 동일). 사용자 경고 없음.
- **D-16: 저장 실패도 silent** — `Storage.setItem` 실패 → console.error + Sentry 보고 (production), UI 차단 안 함. result 화면은 메모리 기반으로 표시. 다음 진입 시엔 lock 안 됨.
- **D-17: Sentry 보고 (production만)** — fetch 에러와 동일 패턴. `Sentry.captureException(err, { extra: { phase: 'tarot_storage_save' } })`.

### Carry-forward (이전 Phase 결정)

- **P1-D-07** (carry): 카드 텍스트 = Supabase. card_id 만 저장하면 충분.
- **P1-D-08** (carry): 신규 의존성 금지 — date-fns/dayjs 도입 안 함. 네이티브 `Date` + `toLocaleDateString` 사용.
- **P1-D-10** (carry): 단일 라우트 + currentPage. lock 도 currentPage 분기로 처리.
- **P3-D-09** (carry): intro 진입 시 22장 fetch — 본 페이즈는 fetch 옆에 storage 로드 추가. 동일 useEffect.
- **P3-D-10** (carry): fetch 에러 → 에러 화면 + retry. 저장 에러는 별도 처리 (UI 차단 안 함).

### Claude's Discretion

- 신규 훅의 내부 구조 (state 관리, useEffect 순서)
- 자정 비교 함수 위치 (훅 내부 vs `src/utils/dateKST.js` — 단순하면 inline)
- intro CTA 분기 구현 (props vs context — TarotIntro 가 todayDraw boolean 받는 props 추가)
- 손상 데이터 검증 함수 (inline vs 별도 함수 — `isValidTodayDraw`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### v1.0 Storage 패턴 (포팅 기반)

- `src/hooks/useUserInfoStorage.js` — Toss Storage 패턴의 정본. `loadUserInfo`/`saveUserInfo`/`clearUserInfo` + isValidXXX validation + try/catch 처리 패턴을 그대로 미러링.
- `src/hooks/useAnonymousKey.jsx` — Storage import 시그니처 + 환경 graceful degradation 패턴 참고.

### Phase 3 Carry-forward

- `.planning/phases/03-daily-one-card-core/03-CONTEXT.md` — Phase 3 결정. D-09 fetch 시점 / D-10 에러 분기 / D-04 다시 뽑기 (본 페이즈에서 daily lock 으로 의미 변경) carry-forward.
- `.planning/phases/03-daily-one-card-core/03-03-SUMMARY.md` — Phase 3 산출물. TarotPage state 머신 (currentPage 4종, useState 7개), handleHome / handleShare 핸들러.
- `src/pages/TarotPage.jsx` — 본 페이즈가 확장하는 대상. fetch useEffect, currentPage 라우팅, handleHome/handleShare/handleRetry.

### v1.1 마일스톤 결정

- `.planning/PROJECT.md` — v1.1 수익 모델 전환 (광고 → 데일리 무료). Constraints Monetization, Key Decisions 참조.
- `.planning/REQUIREMENTS.md` — DAILY-01/02/03 정의. ADS Retired 섹션 참조 (폐기 사유).
- `.planning/ROADMAP.md` Phase 4 — 4 success criteria.
- `.planning/seeds/22-card-collection-meta-game.md` — v1.2 후보. 본 페이즈의 todayDraw 저장이 컬렉션 누적의 데이터 기반.

### 토스 SDK

- `@apps-in-toss/web-framework` Storage API — `getItem(key) → Promise<string|null>`, `setItem(key, value) → Promise<void>`, `removeItem(key) → Promise<void>`. AIT WebView 내에서만 작동, dev/일반 브라우저에서는 graceful degradation 필요.

</canonical_refs>

<specifics>
## Specific Ideas

### 신규 파일

```
src/hooks/useTodayDrawStorage.js   (신규, useUserInfoStorage 미러)
```

### 수정 파일

```
src/pages/TarotPage.jsx            (Phase 3 산출물 확장)
  - import useTodayDrawStorage
  - intro fetch useEffect 안에 todayDraw 로드 + 자정 비교 + lock 분기 추가
  - handleSelectCard 안에 saveTodayDraw 호출 추가
  - TarotIntro 에 hasTodayDraw prop 전달 (CTA 라벨 + 동작 분기)
  - 또는 TarotIntro 가 onResume / onStart 두 콜백 받음
```

### 데이터 흐름

```
[새로고침/탭 진입]
    ↓
useEffect:
  1. cardsData = await fetchTarotCards()              (Phase 3 그대로)
  2. todayDraw = await loadTodayDraw()                (신규)
  3. todayKST = dateString('Asia/Seoul')
  4. if (todayDraw && todayDraw.date === todayKST):
       setSelectedCardId(todayDraw.card_id)
       setCurrentPage('result')                       (intro 건너뜀)
     else if (todayDraw && todayDraw.date !== todayKST):
       await clearTodayDraw()                         (자정 지남)
       setCurrentPage('intro')
     else:
       setCurrentPage('intro')                        (기본)
    ↓
[intro] (todayDraw 없거나 처음으로 누름)
  CTA: hasTodayDraw ? "다시 보기 ✨" : "뽑기 ✨"
  onClick: hasTodayDraw ? setCurrentPage('result') : startShuffle()
    ↓
[shuffle] (새 카드 뽑기)
  confirm → handleSelectCard(id):
    setSelectedCardId(id)
    saveTodayDraw({ date: todayKST, card_id: id })   (fire-and-forget OK)
    setCurrentPage('result')
    ↓
[result]
  - 처음으로 → handleHome (intro 복귀, lock 은 새로고침 시 발동)
  - 공유하기 → Phase 5 SHARE-01 (현재 stub)
```

### 자정 리셋 헬퍼 (inline 또는 src/utils)

```javascript
// 옵션 1: 훅 내부 inline
function todayKST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}

// 옵션 2: src/utils/dateKST.js (재사용 시 분리)
export function todayKST() { ... }
```

</specifics>

<deferred>
## Deferred Ideas

- **22장 컬렉션 누적** — 본 페이즈는 todayDraw 1건만 저장. v1.2 가 `collected_card_ids: number[]` 추가하여 daily 진입마다 union.
- **archive (기록) 탭** — 프로토타입의 archive 라우트. 본 마일스톤 미포함, v1.2 22장 컬렉션과 함께.
- **자정 lock 우회 방지** — 디바이스 시각 변경 검증. 서버 시각 비교는 별도 마일스톤.
- **소셜 공유 OG 이미지** — Phase 5 SHARE-01 작업.
- **Firebase Analytics already_drawn 플래그** — Phase 5 ANL-01 작업 (단 본 페이즈가 todayDraw state 를 노출해야 ANL-01 이 사용 가능).
- **자정 직전 reactive 화면 전환** — 사용자가 23:59:30 에 result 보다가 00:00:01 에 intro 로 전환되는 UX. 본 마일스톤 미포함, 새로고침 시점에만 적용.

</deferred>

---

*Phase: 04-daily-lock-and-storage*
*Context gathered: 2026-05-03 — v1.1 수익 모델 전환 (광고 → 데일리 무료) 후속 작업*
