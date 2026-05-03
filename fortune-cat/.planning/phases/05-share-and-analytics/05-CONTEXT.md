# Phase 05: 공유 + Analytics 마무리 - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning

<domain>
## Phase Boundary

타로 결과 화면에서 토스 공유 시트로 카드/해석을 외부에 공유할 수 있고, 타로 탭 진입·카드 뽑기·공유 3종 이벤트가 Firebase Analytics 에 기록된다. 추가로 v1.1 출시 일관성을 위해 앱 이름과 OG 이미지를 '복냥사주&타로' 통합 브랜딩으로 갱신한다.

**책임:**
- TarotResult 의 `handleShare` stub → `getTossShareLink + share` 실구현 (SHARE-01)
- TarotPage useEffect 진입 이벤트 `tarot_view` (already_drawn 플래그) (ANL-01)
- handleSelectCard 카드 뽑기 이벤트 `card_drawn` (card_id) (ANL-02)
- handleShare 성공 후 공유 이벤트 `card_shared` (card_id, with_link) (ANL-03)
- 앱 이름 및 OG 이미지 '복냥사주&타로' 통합 브랜딩 갱신

**책임 외 (다른 작업):**
- Toss 미니앱 콘솔 등록명/아이콘 변경 — 사용자가 콘솔에서 직접 (코드 변경 외)
- Supabase Storage 의 `og_image.png` 업로드 — 사용자가 디자인 + 업로드 (또는 별도 자산 마일스톤)

</domain>

<decisions>
## Implementation Decisions

### 공유 메시지 포맷

- **D-01: 메시지 포맷 = 헤드라인 + 메시지 80자 트림 + 토스 링크** (프로토타입 패턴, boknyang-tarot result.tsx 매칭)
  - 헤드라인: `[복냥타로] 오늘의 카드 — {nameKo} · {nameEn}`
  - 본문: `card.message.length > 80 ? card.message.slice(0, 80) + '…' : card.message`
  - 링크: `getTossShareLink(deepLink, OG_URL)` 반환값
  - 최종: `${headline}\n${snippet}\n${link}` (link 가 없으면 headline + snippet 만)

### 공유 deeplink 도착 페이지

- **D-02: deeplink = `intoss://fortune-cat/tarot`** — 받은 사람도 자기 카드 뽑게 타로 탭으로 직진
  - Sandbox 환경: `intoss-private://appsintoss?_deploymentId=${env.getDeploymentId()}` (HomePage 동일 패턴)
  - Production 환경: `intoss://fortune-cat/tarot`
  - 보낸 사람의 카드 결과 URL 미리보기는 본 마일스톤 미포함 (저장 키 공유 + URL 파싱 필요 — v1.2+ 후보)

### OG 이미지 + 앱 브랜딩 갱신

- **D-03: OG 이미지 = 정적 1장 (이미 구현, Supabase Storage `menu_images/og_image.png`)** — 단 v1.1 출시에 맞춰 '복냥사주&타로' 통합 브랜딩 이미지로 교체
  - 교체 위치: Supabase Storage `menu_images/og_image.png` (사용자가 디자인 + 업로드 직접)
  - 코드 변경 없음 — 같은 URL 재사용 (`getOgImageUrl()` 헬퍼 그대로)
  - 카드별 22종 다른 이미지 미도입 (호스팅/동기화 부담)
- **D-04: 앱 displayName 변경 = '복냥사주' → '복냥사주&타로'**
  - 위치: `granite.config.ts` `brand.displayName`
  - Toss 콘솔 등록명 변경은 사용자가 직접 (코드 외)
  - app icon URL 변경 여부도 사용자 디자인 자산 준비 시 별도 결정

### Analytics 이벤트 명명 + 파라미터

- **D-05: 이벤트 컨벤션 = v1.0 패턴 동일 (`logEvent("event_name", { params })`)**
- **D-06: ANL-01 — `tarot_view`** (TarotPage useEffect, intro/result 진입 시점 1회)
  - params: `{ already_drawn: boolean }` — Phase 4 의 todayDraw state 잠금 활용
  - 발화 시점: useEffect 안의 storage 로드 완료 직후 1회 (cardsData 도 fetch 완료 시점)
  - cancelled flag 안에서 호출 (Pitfall 7 회피)
- **D-07: ANL-02 — `card_drawn`** (handleSelectCard 안)
  - params: `{ card_id: number, slot: number }` — slot 은 부채꼴 위치 0/1/2 (참고용)
  - 발화 시점: shuffle 의 confirm 버튼 → handleSelectCard(id) 안에서 setCurrentPage('result') 직전
  - saveTodayDraw 와 동일 라인에 발화 (둘 다 fire-and-forget OK)
- **D-08: ANL-03 — `card_shared`** (handleShare 의 share 성공 후)
  - params: `{ card_id: number, with_link: boolean }` — with_link = `Boolean(link)` (getTossShareLink 성공 여부)
  - 발화 시점: `await share({ message })` 성공 후 1회
  - 사용자 취소·실패 시 발화 안 함 (catch 블록 silent)

### 공유 실패 graceful degradation

- **D-09: 공유 실패 silent (HomePage 패턴 동일)**
  - try/catch 로 감싸 `console.error('[TarotPage] 공유 실패:', error)` 만
  - 사용자 알림 (toast/alert) 없음 — v1.0 일관성
  - getTossShareLink 실패 시 `link = undefined` 로 두고 `share({ message })` 만 시도 (헤드라인 + 메시지)
  - share 자체가 실패해도 silent (사용자가 명시적 취소도 동일 catch)
  - 토스 미지원 환경 (일반 브라우저) → `typeof getTossShareLink === 'function'` 가드. 미지원이면 navigator.share / clipboard 폴백은 도입 안 함 (HomePage 도 폴백 없음 — 일관성)

### Carry-forward (이전 Phase 결정)

- **P1-D-08** (carry): 신규 의존성 금지 — `@apps-in-toss/web-framework` 의 `getTossShareLink + share` 만 사용
- **P3-D-04 + Phase 4 D-13**: TarotResult 의 `onShare` 콜백은 이미 잠겨 있음 — Phase 5 는 TarotPage 의 `handleShare` 본체만 채움
- **Phase 4 D-10/D-11**: TarotPage 의 `todayDraw` state 가 already_drawn 플래그로 즉시 활용 가능

### Claude's Discretion

- `tarot_view` 이벤트 발화 시점 (Loader 표시 중 vs intro 표시 후) — useEffect 마지막 단계가 자연스러움
- `share_attempted` 사전 이벤트 추가 여부 (프로토타입 result.tsx 처럼) — 본 페이즈 미포함, ANL-03 1종만
- 헤드라인의 한국어/영어 비율 (`[복냥타로]` 대괄호 vs 다른 마커)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### v1.0 Share + Analytics 패턴 (포팅 기반)

- `src/pages/HomePage.jsx:184-194` — `handleShare` 의 정본 패턴. `getTossShareLink + share + try/catch silent + logEvent("share_click")`
- `src/lib/firebase.js:30+` — `logEvent(eventName, eventParams)` 래퍼. Firebase Analytics 초기화 후 자동 user_id 세팅됨.
- `src/lib/supabase.js:35-38` — `getOgImageUrl()` 헬퍼. Supabase Storage `menu_images/og_image.png`.
- `src/components/DeepReadingResult.jsx:99-108` — `logEvent + Analytics.click` 패턴 (참고).

### Toss SDK 시그니처

- `@apps-in-toss/web-framework` — `getTossShareLink(deepLink: string, ogImageUrl?: string) → Promise<string>`, `share({ message: string }) → Promise<void>`. AIT WebView 안에서만 작동.
- `@apps-in-toss/web-framework/config` — `defineConfig({ brand: { displayName, ... } })`. v1.1 출시 시 `'복냥사주' → '복냥사주&타로'`.

### Phase Carry-forward

- `.planning/phases/04-daily-lock-and-storage/04-CONTEXT.md` — Phase 4 결정. todayDraw state 가 already_drawn 플래그 데이터 소스.
- `.planning/phases/03-daily-one-card-core/03-03-SUMMARY.md` — Phase 3 산출물. handleShare stub 의 위치 + 시그니처.
- `src/pages/TarotPage.jsx` — Phase 5 가 확장하는 대상. handleShare 본체 채우기 + tarot_view useEffect 발화 + handleSelectCard 안 card_drawn 발화.

### v1.1 마일스톤 결정

- `.planning/PROJECT.md` — v1.1 수익 모델 = 데일리 무료 (광고 0). 공유 후 광고 미포함.
- `.planning/REQUIREMENTS.md` — SHARE-01, ANL-01/02/03 정의.
- `.planning/ROADMAP.md` Phase 5 — 5 success criteria.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `getTossShareLink + share` from `@apps-in-toss/web-framework` (HomePage 사용 중)
- `logEvent` from `src/lib/firebase.js` (전역 Analytics 래퍼)
- `getOgImageUrl()` from `src/lib/supabase.js` (Supabase Storage URL 헬퍼)
- `useAnonymousKey` Context — Firebase Analytics user_id 자동 설정됨 (별도 코드 불필요)

### Established Patterns

- 공유: try/catch silent, 사용자 알림 없음 (HomePage 패턴)
- Analytics: `logEvent("snake_case", { params })` (DeepReadingResult, HomePage)
- Sandbox/Production deeplink 분기: `getOperationalEnvironment() === 'sandbox'` (HomePage:186-189)

### Integration Points

- TarotPage.jsx 의 `handleShare` stub (현재 console.log) → 실구현 교체
- TarotPage.jsx 의 `useEffect` (Phase 4 가 마련) → tarot_view 발화 1줄 추가
- TarotPage.jsx 의 `handleSelectCard` → card_drawn 발화 1줄 추가
- granite.config.ts → displayName 1줄 변경

</code_context>

<specifics>
## Specific Ideas

### 사용자 명시 추가 사항 (D-03/D-04 발생 배경)

- 사용자 의견: "OG 이미지가 이미 구현되어 있으나 '복냥사주' 이미지로 되어 있어서, 앱 이름과 이미지를 '복냥사주&타로'로 변경 필요"
- 구현 영향: granite.config.ts 1줄 변경 + Supabase Storage 의 `og_image.png` 사용자 직접 교체

### 프로토타입 result.tsx 의 share 코드 (참고)

`/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/routes/result.tsx:55-89` — 헤드라인 + 80자 트림 + 토스 링크 + with_link 플래그 + sandbox/prod 분기 패턴 그대로 차용.

</specifics>

<deferred>
## Deferred Ideas

- **Toss 콘솔 등록명/아이콘 변경** — granite.config.ts 의 displayName 만 코드에 반영. 콘솔 자체 등록명·아이콘 교체는 사용자가 별도로 진행 (출시 게이팅 작업).
- **카드별 22종 OG 이미지** — 호스팅·동기화 부담. v1.2 마일스톤 후보.
- **공유 받은 사람에게 보낸 사람 카드 미리보기 표시** — 저장 키 URL-encode + 받는 페이지 파싱 필요. v1.2 후보.
- **`share_attempted` 사전 이벤트** — 프로토타입에는 있지만 funnel 분석 필요성 불명. v1.1 출시 후 데이터 보고 결정.
- **`navigator.share` / `clipboard` 폴백** — 일반 브라우저 환경. v1.0 도 폴백 없음 — 일관성 유지.
- **공유 후 토스트 노출** — 사용자 피드백 강화 후보. v1.0 패턴(silent)과 일관성 유지가 본 마일스톤 결정.

</deferred>

---

*Phase: 05-share-and-analytics*
*Context gathered: 2026-05-03*
