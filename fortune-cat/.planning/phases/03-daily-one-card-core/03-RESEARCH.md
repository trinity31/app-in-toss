# Phase 3: 데일리 원카드 코어 화면 - Research

**Researched:** 2026-05-02
**Domain:** React 18 + Vite (CSS 3D 카드 뒤집기) + Supabase 데이터 모델 + Apps-in-Toss WebView
**Confidence:** HIGH (CONTEXT.md/UI-SPEC.md/INVENTORY.md/GAPS.md에서 대부분 결정 잠금됨)

## Summary

본 페이즈의 의사결정은 이미 `03-CONTEXT.md`(D-01 ~ D-11)와 `03-UI-SPEC.md`(Spacing/Typography/Color/Animation 전부 명세)에서 거의 모두 잠금된 상태다. 본 RESEARCH.md의 역할은 **잠금된 결정을 실행 가능한 코드 패턴·SQL·체크리스트로 풀어내는 것**이다. 새로운 라이브러리·아키텍처를 제안하지 않는다 (D-02 신규 의존성 금지 carry-forward).

핵심 검증 사항 8가지(originally asked):

1. **카드 뒤집기 60fps:** CSS `transform: rotateY(180deg)` + `transform-style: preserve-3d` + `backface-visibility: hidden`로 충분 — GPU 합성 레이어로 60fps 보장. `prefers-reduced-motion`은 `src/index.css`에 이미 글로벌 적용 중이므로 추가 코드 불필요.
2. **Daily 결정 로직:** CONTEXT D-04는 "매번 새 카드"로 명시 — deterministic seed/하루 1회 잠금 모두 deferred. 단순 `Math.random` 기반 셔플로 충분.
3. **타로 카드 데이터 모델:** D-08에서 7컬럼 스키마 + INSERT 22행 마이그레이션으로 잠금. `amulet_types` 패턴(create_amulet_types_table.sql)과 동일한 RLS 정책 적용.
4. **이미지 프리로드:** Vite 정적 import는 빌드 타임에 fingerprinted URL 생성 + 22장 webp 합계 ~수백 KB로 첫 페인트 후 자연 캐싱. 별도 `<link rel="preload">` 불필요. 단, intro 진입 직후 이미지 객체 prefetch(`new Image()`)로 첫 result 표시 시 깜빡임 방지 권장.
5. **결과 화면 상태:** Discretion에 따라 TarotPage useState 충분 (currentPage·cardsData·selectedCardId·errorState 4종). sessionStorage/localStorage 영속화 불필요(매번 새 카드 정책).
6. **/tarot 라우트:** 이미 `App.jsx`에 등록 완료 (Phase 2). Phase 3는 `TarotPage.jsx` 내부 currentPage 상태 머신만 확장.
7. **햅틱 피드백:** `@apps-in-toss/web-bridge`의 `generateHapticFeedback({ type })`이 실재 — 카드 탭/뒤집기에 `'tap'` 또는 `'tickMedium'` 적용 가능. **단 CONTEXT/UI-SPEC에서 햅틱 결정이 없음** — Discretion 영역으로 분류.
8. **4050 접근성:** UI-SPEC Typography 섹션이 16px/1.6 본문 + 14px/700 chip + WCAG AA contrast(4.5:1+) 모두 검증 완료. 추가 연구 불필요.

**Primary recommendation:** 본 페이즈는 **연구로 새 결정을 만들지 말고, CONTEXT/UI-SPEC을 기계적으로 코드로 옮기는 작업**이다. 플래너는 본 RESEARCH.md의 "Standard Stack" / "Architecture Patterns" / "Code Examples" 섹션을 그대로 task로 변환하면 된다.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 셔플/뒤집기 인터랙션
- **D-01:** 셔플 단계 = **부채꼴 3장 중 1장 선택** 패턴(boknyang-tarot `src/routes/shuffle.tsx` + `pickRandomCardId`). intro → '오늘의 카드 뽑기' 탭 → shuffle 진입 시 부채꼴 렌더. 1장 탭 시 그 자리에서 뒤집기 후 result.
- **D-02:** 카드 뒤집기 = **CSS keyframes/`transform: rotateY(180deg)`**, ~0.4s, `transform-style: preserve-3d` + `backface-visibility: hidden`. **framer-motion 도입 금지** (Phase 1 P1-D-08 신규 의존성 금지 carry-forward). 부채꼴 펼침/모이기도 CSS transition. spring 타이밍 포기, 단순 ease-out로 대체.
- **D-03:** 22장 중 매 세션마다 랜덤 3장(중복 없음), 모두 동일 뒷면. 랜덤 알고리즘은 Discretion (Math.random/crypto.getRandomValues).
- **D-04:** '다시 뽑기' = currentPage = 'shuffle'로 돌아가 새 3장 부채꼴. intro 건너뛰고 바로 shuffle. 매 세션마다 새 카드(하루 1회 잠금 정책 없음).

#### 결과 화면 레이아웃
- **D-05:** 결과 화면 = **상단 중앙 큰 카드 이미지 + 아래 텍스트 수직 흐름**. 카드 = 화면 너비 50-60%.
- **D-06:** 텍스트 = `이모지 한국어명 (영문명)` 헤더 → keyword chip 2-4개(rounded pill) → 메시지 ~300자. 본문 16-17px / line-height 1.5-1.6. **메시지 톤 = 프로토타입 cards.ts의 "~다냥" 마스코트 톤 그대로 유지.**
- **D-07:** '다시 뽑기' 버튼 = **화면 하단 fixed 위치, 탭바 바로 위**. `position: fixed; bottom: <탭바높이 + safe-area + 8px>`. spacer 둬서 콘텐츠 안 가림.

#### tarot_cards Supabase 스키마 + fetch
- **D-08:** `tarot_cards` 테이블 7컬럼: `id int PK / name_ko text / name_en text / emoji text / image_path text / keywords text[] / message text`. created_at·updated_at·sort_order·is_active 미포함(deferred). 마이그레이션 위치 `scripts/<날짜>_create_tarot_cards.sql`. 22장 seed = 동일 마이그레이션 INSERT (cards.ts에서 추출, "~다냥" 톤 유지).
- **D-09:** Fetch 시점 = **intro 단계 진입 시 22장 전체 prefetch**. `useEffect`에서 `supabase.from('tarot_cards').select('*')` 1회. shuffle/result 전이는 0 latency.
- **D-10:** Fetch 에러 = intro 로딩 스피너 + "카드 데이터를 불러오지 못했어요" + "다시 시도" 버튼 + `Sentry.captureException`. HomePage `Promise.all` + `setHasError` + `useToast` 패턴 차용.

#### 카드 이미지
- **D-11:** **22장 `.webp` 형식 그대로 유지** (PNG 변환 안 함). `src/assets/images/cards/` 신규 디렉토리에 복사. Vite 정적 import. 헬퍼 모듈 `src/assets/images/cards/index.js`에 `getCardImageUrl(id)` 권장(정확한 위치는 Discretion). Phase 1 GAPS.md "카드 이미지 형식" 행 종결.

### Claude's Discretion (연구가 권고를 제공해야 하는 영역)

- **state 관리 위치:** TarotPage useState 4종으로 시작 (currentPage / cardsData / selectedCardId / errorState). Phase 4·5 시점에 공유 필요성 드러나면 Context로 승격.
- **랜덤 3장 추출 알고리즘:** Math.random vs crypto.getRandomValues vs Fisher-Yates. (본 연구 권고: Fisher-Yates + Math.random — 단순성 우선)
- **부채꼴 각도/간격 정확값:** UI-SPEC이 -15° / 0° / +15° + translateX(±64px)로 이미 명시. 추가 연구 불필요.
- **카드 뒷면 디자인:** UI-SPEC에서 결정 종결됨 — `linear-gradient(135deg, #64119F, #4A0A78)` + 골드 hairline + 🌙 + ✦ 4코너.
- **`getCardImageUrl(id)` 시그니처/위치:** 본 연구 권고 = `src/assets/images/cards/index.js`에서 22 import + Map 반환.
- **intro 카피:** UI-SPEC Copywriting Contract에서 잠금됨 ("오늘의 한 장을 만나보세요" 등).
- **shuffle 부채꼴 펼침 타이밍:** UI-SPEC Animation 섹션에서 0.4s ease-out + stagger 0.08s로 명시.
- **chip 색상:** UI-SPEC에서 잠금 — text=primary, bg=primary-light.
- **다시 뽑기 라벨:** UI-SPEC에서 "다시 뽑기"로 잠금.
- **(연구 추가 발견) 햅틱 피드백:** CONTEXT/UI-SPEC에 결정 없음 — `generateHapticFeedback`은 사용 가능. **본 연구 권고:** 카드 탭 시 `type: 'tap'`, 뒤집기 완료 시 `type: 'tickMedium'`, 환경 미지원/실패 시 silent fail. graceful degradation. 단 사용자 결정 필요 → Discretion으로 표시.

### Deferred Ideas (OUT OF SCOPE)

다음 페이즈로 이월:
- **광고 시청 게이팅** (다시 뽑기 시 광고) → Phase 4 책임. SC3 명시.
- **Firebase Analytics 이벤트** (탭 진입·카드 뽑기·다시 뽑기·공유) → Phase 5 책임.
- **토스 공유 시트** (결과 공유) → Phase 5 책임.

본 마일스톤 외 후보:
- **archive (카드 히스토리)** — 데일리 원카드 1종 정책. 다음 마일스톤 후보.
- **`tarot_cards` 운영 메타데이터** (`updated_at`/`is_active`/`sort_order`) — 시즌 콘텐츠 교체 시 마이그레이션 추가.
- **카드 뒷면 디자인 다양화** — v1.2 이후.
- **카드별 키워드 클릭 시 해석 확장 (인터랙티브 카드)** — 다음 마일스톤 후보.
- **'오늘의 카드' 하루 1회 잠금 정책** — 본 페이즈는 매번 새로 뽑기. 광고 모델 검증 후 재검토.
- **사주 ↔ 타로 데이터 통합** (`CROSS-01`) — 다음 마일스톤 후보.
- **카드 zoomed 인터랙션** (프로토타입 result.tsx 라인 195-232) → Phase 5 책임.

Phase 3 종료 시 cleanup: PROJECT.md 갱신 필요 사항 없음.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TAROT-01 | 사용자가 타로 탭에서 카드 뒷면을 보고 한 장을 뒤집어 오늘의 카드를 뽑을 수 있다 | "Architecture Patterns" §1·§2 (currentPage 상태 머신 + CSS 3D 뒤집기), "Code Examples" §1·§2 (TarotCardArt 포팅 + flip 패턴), "Standard Stack" Core(Emotion/CSS) |
| TAROT-02 | 결과 화면에 카드 이미지·이름·해석 텍스트가 함께 표시된다 | UI-SPEC Layout — Result 섹션이 정확한 시각 구조 명세. "Code Examples" §3·§4 (TarotResult inline 스타일 + 메시지 카드), "Standard Stack" Core(Supabase fetch) |
| TAROT-03 | 사용자가 결과 화면에서 "다시 뽑기" 액션을 시작할 수 있다 (Phase 4에서 광고로 게이팅됨) | UI-SPEC Layout — Result fixed 버튼 + spacer 패턴. "Code Examples" §5 (다시 뽑기 핸들러 = setCurrentPage('shuffle') + 새 3장 reshuffle). Phase 4 광고 wrap 지점 명확화. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

본 절은 fortune-cat의 `./CLAUDE.md` 및 사용자 글로벌 instructions에서 추출한 직접 적용 directive다. 플래너·실행자는 모든 task에서 이를 위반하지 않아야 한다.

| 출처 | Directive | Phase 3 적용 |
|------|-----------|--------------|
| 글로벌 #1 | 한국어로 응답 | RESEARCH.md/PLAN.md/커밋 메시지·코멘트 한국어 작성 |
| 글로벌 #2 | 명시 지시 외 작업 금지 | TarotPage 외 파일은 D-08 마이그레이션·D-11 cards 디렉토리·supabase.js fetchTarotCards 추가만 허용. SajuPage·AmuletPage·HomePage 등 v1.0 코드 일체 변경 금지 (NAV-03 회귀 방지 + UI-SPEC `Cross-Phase Consistency` 명시) |
| 글로벌 #3 | DRY | HomePage `Promise.all` + `setHasError` + `useToast` 패턴 재사용. fetch/에러/로딩 코드 별도 함수로 추출 |
| 글로벌 #4 | Context7로 최신 API 사용 | React 18, Supabase JS 2.86.0, Apps-in-Toss web-bridge — 본 연구 시점 확인 완료(node_modules 직접 검증) |
| 글로벌 #5 | 리소스 삭제 시 목록·확인 | 본 페이즈에는 삭제 작업 없음. 단 마이그레이션이 기존 `tarot_cards` 테이블을 덮어쓸 수 있으면 `IF NOT EXISTS` 사용 |
| 글로벌 #6 | git push 금지 (사용자 요청 시만) | commit_docs:true이므로 RESEARCH.md 자동 commit은 허용. push는 절대 금지 |
| Project | **Tech stack 변경 금지** (React 18 + Vite + TDS Mobile/AIT + Apps-in-Toss web-framework) | framer-motion·zustand·radix·tailwind·lucide-react·clsx·tailwind-merge·class-variance-authority 일체 도입 금지 (D-02 + GAPS 매트릭스) |
| Project | **AIT WebView 제약** | `getAnonymousKey`/IAP/`generateHapticFeedback`은 AIT 환경에서만 동작 — dev 브라우저 graceful degradation 필요 (try/catch + silent fail) |
| Project | **자체 회원 시스템 없음** | 본 페이즈는 anonymousKey/Toss 로그인 일체 사용 안 함 (D-09 fetch만 익명 anon key로 호출) |
| Project | **Data 단일 Supabase** | 신규 `tarot_cards` 테이블만 추가, 기존 saju 테이블과 명명 충돌 없음 (확인 완료) |
| Project | **타로 v1.1은 광고 무제한** | 결제 상품 추가 금지 — Phase 3에서는 결제·광고 모두 미통합. 단순 무제한 다시 뽑기 |
| Project | **AIT 빌드 호환** | `granite.config.ts` 권한 변경 금지. 본 페이즈는 권한·빌드 설정 일체 변경 없음 |
| Project | **모노레포 형제앱 영향 금지** | `app-in-toss/` 부모 디렉토리·`ai-pet-studio` 등 형제 디렉토리 일체 미변경 |
| Project | **GSD Workflow Enforcement** | 모든 Edit/Write는 GSD 페이즈 task로 묶여 실행. 본 RESEARCH.md는 `/gsd-research-phase` 스폰 산출물 |

**위배 시 영향:** Tech stack 위반은 AIT 심사 영향(번들 크기·신규 의존성 검토 필요), 자체 회원 시스템 도입은 PROJECT.md 핵심 결정과 정면 충돌. 위 directive 중 하나라도 어기는 task는 plan_check 또는 verifier에서 자동 거절되어야 한다.

## Standard Stack

### Core (이미 설치, 추가 설치 불필요)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.2.0 | UI framework | fortune-cat 표준 (`package.json` 확인) [VERIFIED: package.json] |
| react-dom | 18.2.0 | React rendering | 표준 [VERIFIED] |
| react-router-dom | 7.9.5 | 클라이언트 라우팅 | `/tarot` 라우트는 Phase 2에서 이미 등록. 본 페이즈 추가 라우트 없음 [VERIFIED: App.jsx] |
| @supabase/supabase-js | 2.86.0 | tarot_cards fetch | 기존 `src/lib/supabase.js`에서 client 생성 + 메뉴 테이블 select 패턴 그대로 [VERIFIED: supabase.js] |
| @toss/tds-mobile | 2.1.2 | `<Loader />` (intro fetch 진행 중) | HomePage 라인 318에서 이미 사용 — 동일 패턴 재사용 [VERIFIED: TDS dist d.ts에 `Loader` export 확인] |
| @toss/tds-colors | 0.1.0 | grey/blue 토큰 보조 | TabBar.jsx에서 `colors.blue500`/`colors.grey500` 사용 패턴 — 본 페이즈도 필요 시 활용 [VERIFIED] |
| @sentry/react | 10.33.0 | fetch 실패 시 captureException | `src/main.jsx`에서 init, `Loading.jsx`에서 사용 패턴 [VERIFIED] |
| @apps-in-toss/web-framework | 2.4.5 | 햅틱 피드백 (Discretion 채택 시) | re-export `@apps-in-toss/web-bridge`의 `generateHapticFeedback` [VERIFIED: web-bridge/dist/generateHapticFeedback.d.ts] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @emotion/react | 11.14.0 | 설치되어 있으나 본 페이즈는 inline style만 사용 (UI-SPEC Design System 명시) | 인라인 style 길이가 200줄 넘어가면 css prop 도입 검토 — 본 페이즈는 미사용 권장 |

### Alternatives Considered (본 페이즈에서 명시적으로 제외)

| Instead of | Could Use | Tradeoff | 결정 |
|------------|-----------|----------|------|
| CSS rotateY 3D flip | framer-motion `motion.div animate={{rotateY: 180}}` | spring/AnimatePresence 등 정밀 모션 사용 가능 | **CSS 채택** — Phase 1 P1-D-08 + 본 페이즈 D-02 신규 의존성 금지 carry-forward. 4050 사용자에 단순 회전이면 충분. |
| useState (TarotPage 로컬) | useReducer / Context (TarotContext) / zustand 재포팅 | 다단계 상태 머신은 useReducer가 더 명시적 | **useState 채택** — Phase 3 범위 안에서 4종 useState로 충분. Phase 4·5 진입 시 공유 필요성 드러나면 Context로 승격 (Discretion) |
| supabase.from() 직접 호출 | TanStack Query/SWR 같은 fetch 캐시 | refetch/staleness 관리 우수 | **직접 호출 채택** — 22장 / intro 1회 호출 / 세션 단위 캐시 불필요. fortune-cat 기존 패턴(HomePage Promise.all) 일관 |
| .webp 이미지 | .png 변환 / .avif | png는 형식 일관성, avif는 더 작음 | **.webp 채택** (D-11) — 파일 크기 ~50% 이점, Vite 정적 import 지원 확인 |
| `<img>` 직접 | Image component (Next/Image 등) | lazy/blur placeholder 자동 | **`<img>` 채택** — Vite 환경. 22장 < 1MB 합계 추정, intro에서 prefetch로 충분 |

**Installation:**
```bash
# 신규 설치 없음 — 모든 의존성이 이미 fortune-cat package.json에 존재
# (Phase 1 P1-D-08 + Phase 3 D-02 신규 의존성 금지 carry-forward)
```

**Version verification (확인 결과):**
- 모든 라이브러리 버전은 `/Users/trinity/Projects/app-in-toss/fortune-cat/package.json` (cat-n읽기로 확인 완료)와 일치
- `node_modules/@apps-in-toss/web-bridge/dist/generateHapticFeedback.d.ts` — `HapticFeedbackType` 10종 + `generateHapticFeedback(options): Promise<void>` API 시그니처 직접 검증 [VERIFIED]
- `node_modules/@toss/tds-mobile/dist/esm/index.d.ts` — `Loader: ComponentWithAs<"div", Props_8>` export 직접 검증 [VERIFIED]

## Architecture Patterns

### Recommended Project Structure (신규/확장 파일만 표시)

```
src/
├── pages/
│   └── TarotPage.jsx               # 확장: useState 4종 + 22장 fetch + currentPage 라우팅
├── components/
│   ├── TarotCardArt.jsx            # 신규 (포팅): 앞/뒷면 + framed 매트
│   ├── TarotIntro.jsx              # 신규 (옵션): intro 단계 — TarotPage inline 가능
│   ├── TarotShuffle.jsx            # 신규 (옵션): shuffle 단계 — TarotPage inline 가능
│   └── TarotResult.jsx             # 신규: result 단계 (fixed 버튼·spacer 캡슐화 위해 분리 권장)
├── lib/
│   └── supabase.js                 # 확장: fetchTarotCards() 함수 추가
├── assets/images/cards/            # 신규 디렉토리
│   ├── 00.webp ~ 21.webp           # 22장 (boknyang-tarot/public/cards에서 복사)
│   └── index.js                    # 신규: getCardImageUrl(id) 헬퍼
scripts/
└── 2026XXXX_create_tarot_cards.sql # 신규 마이그레이션 (스키마 + 22 row INSERT)
```

### Pattern 1: currentPage 상태 머신 (Phase 2 D-04 carry-forward)

**What:** 단일 라우트 안에서 useState로 단계별 화면 전환. Phase 2에서 합의된 SajuPage/AmuletPage/NewYearPage 일관 패턴.
**When to use:** `/tarot` 라우트 안의 `intro → shuffle → result` 3단계.
**Example (스켈레톤):**
```jsx
// Source: SajuPage.jsx / AmuletPage.jsx 패턴 ([VERIFIED: src/pages/TarotPage.jsx 현재 placeholder])
import { useEffect, useState } from 'react'
import { Loader } from '@toss/tds-mobile'
import * as Sentry from '@sentry/react'
import { fetchTarotCards } from '../lib/supabase'
import TarotIntro from '../components/TarotIntro'
import TarotShuffle from '../components/TarotShuffle'
import TarotResult from '../components/TarotResult'

export default function TarotPage() {
  const [currentPage, setCurrentPage] = useState('intro')   // 'intro' | 'shuffle' | 'result'
  const [cardsData, setCardsData] = useState([])             // 22장 전체
  const [shuffledThree, setShuffledThree] = useState([])     // 매 shuffle 진입 시 3장
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [errorState, setErrorState] = useState(null)         // 'fetch_failed' | null
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setIsLoading(true); setErrorState(null)
        const data = await fetchTarotCards()
        if (cancelled) return
        setCardsData(data)
      } catch (err) {
        if (cancelled) return
        console.error('[TarotPage] tarot_cards fetch 실패:', err)
        Sentry.captureException(err, { extra: { phase: 'tarot_intro_fetch' } })
        setErrorState('fetch_failed')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const startShuffle = () => {
    setShuffledThree(pickThreeRandom(cardsData))   // see Pattern 4
    setSelectedCardId(null)
    setCurrentPage('shuffle')
  }
  const handleSelectCard = (id) => { setSelectedCardId(id); setCurrentPage('result') }
  const handleRedraw = () => startShuffle()       // D-04: intro 건너뛰고 바로 shuffle

  if (isLoading) return <TarotLoading />
  if (errorState === 'fetch_failed') return <TarotError onRetry={() => /* refetch */} />

  return (
    <div data-current-page={currentPage}>
      {currentPage === 'intro' && <TarotIntro onStart={startShuffle} />}
      {currentPage === 'shuffle' && <TarotShuffle cards={shuffledThree} onSelect={handleSelectCard} />}
      {currentPage === 'result' && (
        <TarotResult
          card={cardsData.find((c) => c.id === selectedCardId)}
          onRedraw={handleRedraw}
        />
      )}
    </div>
  )
}
```

### Pattern 2: CSS 3D 카드 뒤집기 (D-02)

**What:** `transform: rotateY(180deg)` + `transform-style: preserve-3d` + `backface-visibility: hidden`로 GPU 합성된 뒤집기 애니메이션.
**When to use:** Shuffle 카드 탭 → result 진입 직전 0.4-0.5s 뒤집기. Result 화면 진입 직후 카드가 뒷면→앞면으로 전환.
**Example:**
```jsx
// Source: boknyang-tarot/src/routes/result.tsx 라인 102-137 패턴 + framer-motion 제거
// [VERIFIED: prototype source code + UI-SPEC §Animation 0.5s cubic-bezier(0.22, 1, 0.36, 1)]
function FlipCard({ card, flipped }) {
  return (
    <div style={{ perspective: 1200 }}>
      <div
        style={{
          position: 'relative',
          width: 200, height: 300,
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',  // GPU 레이어 강제 (모바일 합성 안정화)
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <TarotCardArt faceUp={false} size="lg" framed />
        </div>
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
        }}>
          <TarotCardArt
            faceUp
            image={getCardImageUrl(card.id)}
            emoji={card.emoji}
            nameEn={card.name_en}
            size="lg"
            framed
          />
        </div>
      </div>
    </div>
  )
}
```

**중요 디테일:**
- **`-webkit-backface-visibility`** vendor prefix 필수 — iOS Safari < 16에서 backface-visibility hidden이 prefix 없이 동작 안 함 [CITED: MDN — `backface-visibility` browser compat]
- **`will-change: transform`** — 합성 레이어 강제. 단 항상 켜지 말고 뒤집기 직전에만 적용해 메모리 낭비 방지 (작은 카드 1장은 무시할 수준이라 상시 ON 허용)
- **prefers-reduced-motion**: `src/index.css` 라인 92-98이 이미 글로벌 적용 중 — 별도 코드 불필요. 자동으로 0.01ms로 단축됨 [VERIFIED]

### Pattern 3: HomePage Promise.all + setHasError + useToast (D-09, D-10)

**What:** intro 단계 fetch 진행 중·실패 처리 패턴. fortune-cat HomePage의 검증된 패턴 그대로.
**When to use:** `tarot_cards` 22장 select가 fetch/에러/재시도 3상태를 가질 때.
**Example:**
```jsx
// Source: HomePage.jsx 라인 88-130, 307-352 [VERIFIED]
async function fetchTarotCards() {
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('id, name_ko, name_en, emoji, image_path, keywords, message')
    .order('id', { ascending: true })
  if (error) throw error
  return data || []
}
```

로딩/에러 UI는 UI-SPEC `Loading & Error States` 섹션의 `<Loader />` + 헤드라인 + 재시도 버튼 패턴(HomePage 라인 307-352)을 그대로 차용. 토스트도 `useToast.openToast({ message: '카드 데이터를 불러오지 못했어요' })`로 동시 알림.

### Pattern 4: Fisher-Yates 셔플 + 상위 3장 선택 (D-03)

**What:** 22장에서 중복 없는 랜덤 3장 선택.
**When to use:** intro → shuffle 진입 시 + 다시 뽑기 액션 시.
**Example:**
```jsx
// Source: 표준 Fisher-Yates [CITED: Wikipedia — Fisher-Yates shuffle]
function pickThreeRandom(cards) {
  if (!Array.isArray(cards) || cards.length < 3) return []
  // shallow copy — 원본 cardsData 변경 금지
  const arr = cards.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, 3)
}
```

**대안 비교:**
| 알고리즘 | 동작 | 코드 길이 | 권장 |
|---------|------|----------|------|
| Fisher-Yates + Math.random | 정확한 균등 분포 | ~6줄 | ✅ 채택 |
| `arr.sort(() => Math.random() - 0.5)` | 분포 비대칭(브라우저별 sort 알고리즘 차이) | 1줄 | ❌ 안티패턴 |
| crypto.getRandomValues | 암호학적 안전 | ~10줄 | 과잉 (타로 결과는 보안 영역 아님) |

### Pattern 5: 부채꼴 3장 + 즉시 뒤집기 (D-01, UI-SPEC Layout shuffle)

**What:** 3장 카드를 absolute로 부채꼴 배치, 탭 시 그 자리에서 뒤집기 → result.
**When to use:** shuffle 단계.
**Example (스켈레톤):**
```jsx
// Source: boknyang-tarot shuffle.tsx 라인 40-115 패턴 + framer-motion 제거
// [VERIFIED: UI-SPEC layout shuffle 섹션 (-15°/0°/+15°, translateX ±64px)]
const POSITIONS = [
  { x: -64, rot: -15 },
  { x: 0,   rot: 0   },
  { x: 64,  rot: 15  },
]

function TarotShuffle({ cards, onSelect }) {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [flipping, setFlipping] = useState(false)

  const handleTap = (slotIdx) => {
    if (selectedSlot !== null) return
    setSelectedSlot(slotIdx)
    setFlipping(true)
    // CSS 트랜지션 끝난 뒤 result로 진입 (UI-SPEC: 0.5s flip + 0.2s scale)
    setTimeout(() => onSelect(cards[slotIdx].id), 700)
  }

  return (
    <div style={{ position: 'relative', height: 240, width: '100%' }}>
      {cards.map((card, i) => {
        const isSel = selectedSlot === i
        const isOther = selectedSlot !== null && !isSel
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => handleTap(i)}
            aria-label={`카드 ${i + 1}번 선택`}
            style={{
              position: 'absolute',
              top: 0, left: '50%',
              marginLeft: -60,  // 카드 너비 120px의 절반
              transform: `translateX(${isSel ? 0 : POSITIONS[i].x}px) rotate(${isSel ? 0 : POSITIONS[i].rot}deg) scale(${isSel ? 1.15 : 1})`,
              opacity: isOther ? 0.3 : 1,
              transition: 'transform 0.4s ease-out, opacity 0.3s ease-out',
              transitionDelay: `${i * 0.08}s`,  // stagger
              border: 0, background: 'transparent', cursor: 'pointer',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* isSel일 때 FlipCard, 아니면 뒷면 정적 표시 */}
            {isSel && flipping
              ? <FlipCard card={card} flipped />
              : <TarotCardArt faceUp={false} size="md" />
            }
          </button>
        )
      })}
    </div>
  )
}
```

### Pattern 6: 이미지 정적 import + 헬퍼 (D-11)

**What:** 22장 webp를 빌드 타임에 fingerprint된 URL로 변환, id로 lookup.
**When to use:** `<TarotCardArt image={getCardImageUrl(id)}>` 호출.
**Example:**
```jsx
// File: src/assets/images/cards/index.js
// [VERIFIED: Vite docs — Static Asset Handling supports import for .webp]
import card00 from './00.webp'
import card01 from './01.webp'
import card02 from './02.webp'
// ... 22 imports
import card21 from './21.webp'

const CARD_IMAGES = [
  card00, card01, card02, card03, card04, card05, card06, card07,
  card08, card09, card10, card11, card12, card13, card14, card15,
  card16, card17, card18, card19, card20, card21,
]

export function getCardImageUrl(id) {
  if (!Number.isInteger(id) || id < 0 || id > 21) {
    console.warn(`[cards] invalid card id: ${id}`)
    return CARD_IMAGES[0]  // fallback to The Fool
  }
  return CARD_IMAGES[id]
}

// (옵션) intro 진입 직후 prefetch — 첫 result 표시 깜빡임 방지
export function prefetchAllCardImages() {
  if (typeof window === 'undefined') return
  CARD_IMAGES.forEach((url) => {
    const img = new Image()
    img.src = url
  })
}
```

**중요:**
- `image_path` 컬럼은 단순 `'00.webp'` 문자열만 저장 — 클라이언트는 컬럼 값이 아닌 `id`로 헬퍼를 호출. (Phase 4·5에서 동적 카드 추가 시에만 image_path가 의미 있음 — 본 페이즈는 정적 매핑으로 충분)
- 22장 합계 < 수백 KB 추정 (webp 50% 이점) → 번들 크기 영향 미미. AIT 심사 영향 없음.

### Anti-Patterns to Avoid

- **`transition: all`:** UI-SPEC 명시 금지. transform·opacity 같은 명시적 property만 사용 (모바일 paint thrashing 방지).
- **무한 wobble 애니메이션:** 프로토타입 shuffle.tsx 라인 99-108의 `repeat: Infinity`. UI-SPEC 명시 금지 (4050 시각 부담 + framer-motion 의존성).
- **`new Date()` 사용 후 KST 변환 누락:** fortune-cat은 KST 사용자 — `getTodayOrderCount()` 패턴(supabase.js 라인 86-117)처럼 9h 오프셋 명시 필요. 단 본 페이즈는 매 세션 새 카드라 날짜 의존 없음.
- **`Math.random()`을 sort 콜백으로 사용:** 분포 비대칭. Fisher-Yates 사용.
- **`backfaceVisibility` vendor prefix 누락:** iOS Safari < 16에서 양면 모두 보임 버그.
- **`useEffect` cleanup 없는 fetch:** unmount 후 setState → React warning. Pattern 1의 `cancelled` flag 패턴 사용.
- **이미지 컬럼에 풀 URL 저장:** Supabase Storage CDN URL을 컬럼에 박아두면 마이그레이션 시 손 작업 늘어남. 본 페이즈는 정적 import이므로 image_path는 파일명만 저장.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 카드 뒤집기 애니메이션 | requestAnimationFrame + 수동 transform 보간 | CSS `transition: transform` + `cubic-bezier` | GPU 합성 + browser optimized + reduced-motion 자동 대응 |
| 타로 카드 데이터 영속화 | localStorage 직접 다루기 | (영속화 자체 안 함) | D-04: 매 세션 새 카드. 영속화하면 정책 위반 |
| 셔플 알고리즘 | 직접 구현 | Fisher-Yates 6줄 (Pattern 4) | 표준·검증·1회만 작성 |
| 모션 감소 사용자 대응 | 컴포넌트별 prefers-reduced-motion 체크 | `src/index.css` 글로벌 미디어쿼리 (이미 적용) | DRY + 일관성 |
| 안전 영역(safe-area) 처리 | 디바이스별 분기 | `env(safe-area-inset-bottom)` CSS 함수 | iOS/Android 자동 |
| 햅틱 진동 | navigator.vibrate (브라우저 API) | `generateHapticFeedback({ type: 'tap' })` | AIT 환경 표준. 미지원 시 silent fail (try/catch) |
| Supabase 클라이언트 | 새 createClient() 호출 | 기존 `import { supabase } from '../lib/supabase'` | DRY + 환경변수 일원화 |
| 이미지 fingerprinting | 수동 캐시 버스팅 | Vite 정적 import (자동 hash) | 빌드 시스템에 위임 |
| Sentry 초기화 | 페이지별 init | 기존 main.jsx의 글로벌 init 사용 — `Sentry.captureException()`만 호출 | DRY |
| TabBar 통합 | TarotPage 안에서 TabBar 렌더 | `App.jsx`에서 이미 `<TabBar />` 형제 배치 (Phase 2) — 본 페이즈 변경 없음 | Phase 2 P2-D-02 보호 |

**Key insight:** 본 페이즈는 신규 인프라를 만드는 페이즈가 아니라 **기존 fortune-cat 패턴을 가져와 타로 도메인에 끼워 맞추는** 페이즈다. 새로운 추상화를 만들고 싶은 충동을 억제해야 한다.

## Common Pitfalls

### Pitfall 1: backface-visibility의 iOS Safari < 16 버그
**What goes wrong:** 카드 뒤집기 시 앞면·뒷면이 동시에 보이거나, 깜빡이는 잔상이 생긴다.
**Why it happens:** WebKit이 `backface-visibility: hidden`을 prefix 없이 인식 안 하거나 합성 레이어 분리를 못 함.
**How to avoid:** `WebkitBackfaceVisibility: 'hidden'` vendor prefix 명시. 부모에 `perspective: 1200px` + 자식에 `transform-style: preserve-3d` + 양면 layer 모두 `position: absolute; inset: 0;`.
**Warning signs:** 뒤집기 도중 화면 깜빡임, 텍스트가 거꾸로 보이는 잠깐의 잔상.

### Pitfall 2: 22장 이미지 첫 result 표시 시 깜빡임
**What goes wrong:** 사용자가 카드 탭 → 뒤집기 시작 → 앞면 이미지가 막 로드되면서 회색 박스가 잠깐 보임.
**Why it happens:** Vite 정적 import는 빌드 타임에 URL 생성하지만 브라우저 다운로드는 지연 로드.
**How to avoid:** intro 단계 진입 직후 `prefetchAllCardImages()` 호출 (Pattern 6). 22장 합계 작아서 prefetch 부담 없음. 또는 `<link rel="preload" as="image" href={url}>` head 주입.
**Warning signs:** 뒤집기 직후 0.1-0.3s 동안 카드 앞면이 비어 보임 (slow 3G 시 1초 이상).

### Pitfall 3: Supabase tarot_cards 빈 배열 반환 (RLS 정책 누락)
**What goes wrong:** `.select('*')`가 200 OK + 0행 반환. 클라이언트는 에러 없이 `cards.length === 0` 상태로 진입 → 빈 화면.
**Why it happens:** Supabase Row Level Security가 기본 활성화 — `select_policy` USING(true) 누락 시 anon role 읽기 거부.
**How to avoid:** 마이그레이션에 `CREATE POLICY ... FOR SELECT USING (true)` 명시. `amulet_types` 마이그레이션(create_amulet_types_table.sql 라인 21-25) 패턴 그대로 복사.
**Warning signs:** Supabase Studio에서는 22행 보이는데 client에서 `[]` 반환.

### Pitfall 4: AIT WebView 외부(개발 브라우저)에서 generateHapticFeedback 크래시
**What goes wrong:** Vite dev 서버에서 햅틱 호출 시 native bridge 미연결로 reject 또는 throw.
**Why it happens:** `@apps-in-toss/web-bridge`는 native bridge가 있어야 동작. 일반 브라우저는 bridge 없음.
**How to avoid:** try/catch + silent fail. 또는 `getOperationalEnvironment()`로 환경 확인 후 분기.
```jsx
async function safeHaptic(type) {
  try {
    const { generateHapticFeedback } = await import('@apps-in-toss/web-framework')
    if (typeof generateHapticFeedback === 'function') {
      await generateHapticFeedback({ type })
    }
  } catch {
    // graceful degradation — 데스크탑/브라우저 환경 무시
  }
}
```
**Warning signs:** dev 콘솔에 `Cannot read property of undefined` 또는 unhandled promise rejection.

### Pitfall 5: useState 4종으로 시작했는데 Phase 4·5에서 prop drilling 폭발
**What goes wrong:** Phase 4 광고 컴포넌트가 다시 뽑기 핸들러를 받아야 하고, Phase 5 공유 컴포넌트가 selectedCard를 받아야 함 → TarotPage에서 끝없이 props 내려보내기.
**Why it happens:** Phase 3에서 useState 채택 — Phase 4·5 진입 시 공유 필요성이 드러남.
**How to avoid:** **본 페이즈는 그대로 useState 유지.** Phase 4·5 진입 시점에 `TarotContext.jsx`로 승격 (Discretion 명시). 본 페이즈에서 미리 Context 만들면 over-engineering.
**Warning signs:** Phase 4 PLAN에서 "TarotPage가 광고 시청 결과를 어떻게 받지?" 질문이 나옴.

### Pitfall 6: 다시 뽑기 클릭 시 같은 3장 부채꼴 재현
**What goes wrong:** D-04는 "새 3장"을 명시하는데 코드에서 `shuffledThree` state 재계산 누락 → 같은 카드 보임.
**Why it happens:** `setCurrentPage('shuffle')`만 호출, `setShuffledThree(pickThreeRandom(...))` 누락.
**How to avoid:** Pattern 1의 `startShuffle()` 함수 안에서 매번 `pickThreeRandom` 호출. `handleRedraw = startShuffle`로 alias.
**Warning signs:** 다시 뽑기 후에도 같은 3장이 같은 자리에 노출.

### Pitfall 7: cleanup 없는 useEffect로 인한 React state warning
**What goes wrong:** 사용자가 intro 진입 직후 다른 탭(/`)으로 이동 → 컴포넌트 unmount → fetch 응답 도착 → setState → "Can't perform a React state update on an unmounted component" warning.
**Why it happens:** AbortController/cancelled flag 누락.
**How to avoid:** Pattern 1의 `cancelled` 클로저 변수 + cleanup. AbortController는 supabase-js가 직접 지원 안 하므로 cancelled flag로 충분.

### Pitfall 8: 폰트 weight 600 사용 (UI-SPEC 위반)
**What goes wrong:** HomePage·Result.jsx 패턴을 그대로 복사했더니 600 semibold가 섞여 들어감. UI-SPEC Dimension 4 BLOCK 재발.
**Why it happens:** v1.0 페이지(`Result.jsx`·`HomePage.jsx`)는 보조 라벨에 600을 혼용 — 본 페이즈는 weight 통일 정책으로 400/700만 허용.
**How to avoid:** PLAN에 "신규 작성 컴포넌트 모든 fontWeight 검증" task 포함. v1.0 기존 코드는 미수정.
**Warning signs:** UI-SPEC checker가 Dimension 4에서 fail.

## Code Examples

### §1 Supabase fetchTarotCards (Pattern 3 보강)

```jsx
// File: src/lib/supabase.js (확장)
// 기존 함수들(getMenuImageUrl·getAmuletConfig 등) 아래에 추가
export async function fetchTarotCards() {
  const { data, error } = await supabase
    .from('tarot_cards')
    .select('id, name_ko, name_en, emoji, image_path, keywords, message')
    .order('id', { ascending: true })
  if (error) {
    console.error('[supabase] fetchTarotCards 실패:', error)
    throw error
  }
  return data || []
}
```

### §2 TarotCardArt 포팅 (TS→JSX, framer-motion 제거, oklch→hex)

```jsx
// File: src/components/TarotCardArt.jsx
// Source: boknyang-tarot/src/components/TarotCardArt.tsx 포팅 + UI-SPEC Color/Animation 적용
const SIZES = {
  sm: { w: 64,  h: 96,  fs: 28, label: 7,  pad: 4,  radius: 10 },
  md: { w: 120, h: 180, fs: 56, label: 10, pad: 6,  radius: 14 },
  lg: { w: 200, h: 300, fs: 96, label: 14, pad: 10, radius: 18 },
}

export default function TarotCardArt({
  emoji = '🌟',
  nameEn,
  image,
  faceUp = true,
  size = 'md',
  framed = false,
}) {
  const s = SIZES[size]

  const card = (
    <div style={{
      position: 'relative',
      flexShrink: 0,
      overflow: 'hidden',
      width: s.w,
      height: s.h,
      borderRadius: s.radius + 6,
      boxShadow: '0 8px 24px rgba(100, 17, 159, 0.12)',  // UI-SPEC §Layout 카드 외부 shadow
    }}>
      {faceUp ? (image ? <CardImage src={image} alt={nameEn} /> : <CardFront s={s} emoji={emoji} nameEn={nameEn} />) : <CardBack s={s} />}
    </div>
  )

  if (!framed) return card

  const matPad = size === 'lg' ? 10 : size === 'md' ? 8 : 5
  return (
    <div style={{
      position: 'relative',
      flexShrink: 0,
      padding: matPad,
      borderRadius: s.radius + 14,
      background: 'linear-gradient(160deg, #FFF8E6, #F4E6FF)',  // UI-SPEC framed 매트
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
    }}>
      {card}
    </div>
  )
}

function CardImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt ?? 'tarot card'}
      draggable={false}
      style={{
        height: '100%', width: '100%',
        userSelect: 'none', display: 'block',
        objectFit: 'cover',
        // UI-SPEC: 페이드인은 부모 fade-in stagger에서 처리
      }}
    />
  )
}

function CardBack({ s }) {
  // UI-SPEC §Layout 카드 뒷면 디자인 (Phase 3 결정 종결)
  return (
    <div style={{
      position: 'relative', height: '100%', width: '100%',
      background: 'linear-gradient(135deg, #64119F, #4A0A78)',  // primary → primary-dark
    }}>
      {/* 외곽 골드 hairline */}
      <div style={{ position: 'absolute', inset: s.pad, borderRadius: s.radius, border: '1.5px solid #D4A537', pointerEvents: 'none' }} />
      {/* 중앙 🌙 */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: Math.max(36, s.w * 0.36), lineHeight: 1 }}>🌙</span>
      </div>
      {/* 코너 ✦ 4개 */}
      {[
        { top: s.pad + 4, left: s.pad + 4 },
        { top: s.pad + 4, right: s.pad + 4 },
        { bottom: s.pad + 4, left: s.pad + 4 },
        { bottom: s.pad + 4, right: s.pad + 4 },
      ].map((pos, i) => (
        <span key={i} style={{ position: 'absolute', ...pos, color: '#D4A537', fontSize: s.w * 0.07, pointerEvents: 'none' }}>✦</span>
      ))}
    </div>
  )
}

function CardFront({ s, emoji, nameEn }) {
  // 본 페이즈는 image prop이 항상 있으므로 CardFront는 fallback 전용
  // (D-11에서 22장 모두 webp 보장)
  return (
    <div style={{
      position: 'relative', height: '100%', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #FFF8E6, #F4E6FF)',
    }}>
      <span style={{ fontSize: s.fs }}>{emoji}</span>
      {nameEn && (
        <div style={{ position: 'absolute', bottom: s.pad + 4, fontSize: s.label, fontWeight: 700, color: '#191F28' }}>
          {nameEn}
        </div>
      )}
    </div>
  )
}
```

### §3 TarotResult (UI-SPEC §Layout result 그대로)

```jsx
// File: src/components/TarotResult.jsx
// Source: UI-SPEC layout result + Copywriting Contract + Color 토큰 + Typography 매트릭스
import TarotCardArt from './TarotCardArt'
import { getCardImageUrl } from '../assets/images/cards'
import './TarotResult.css'  // (옵션) fade-in keyframes만

export default function TarotResult({ card, onRedraw }) {
  if (!card) return null
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', position: 'relative' }}>
      {/* 본문 영역 */}
      <div style={{ padding: '32px 16px 96px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#6B7684', marginBottom: 8 }}>오늘의 한 장</span>

        {/* 카드 */}
        <FlipCard card={card} flipped />  {/* 진입 직후 즉시 flipped */}

        {/* 24px gap → 카드 이름 헤더 */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
            <span style={{ color: '#191F28' }}>{card.emoji} {card.name_ko} </span>
            <span style={{ color: '#64119F' }}>({card.name_en})</span>
          </h2>
        </div>

        {/* 16px gap → 키워드 chip */}
        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {(card.keywords || []).slice(0, 4).map((k) => (
            <span key={k} style={{
              fontSize: 14, fontWeight: 700,
              color: '#64119F', background: '#F4E6FF',
              padding: '4px 12px', borderRadius: 999,
            }}>#{k}</span>
          ))}
        </div>

        {/* 24px gap → 메시지 카드 */}
        <div style={{
          marginTop: 24,
          background: '#F4E6FF',
          borderRadius: 16,
          padding: 20,
          maxWidth: 360,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.6, color: '#191F28', margin: 0, whiteSpace: 'pre-wrap' }}>
            {card.message}
          </p>
        </div>
      </div>

      {/* 다시 뽑기 fixed 버튼 */}
      <button
        type="button"
        onClick={onRedraw}
        className="tap-card"
        style={{
          position: 'fixed',
          bottom: 'calc(72px + env(safe-area-inset-bottom) + 8px)',
          left: 16, right: 16,
          height: 56,
          fontSize: 16, fontWeight: 700,
          color: '#FFFFFF',
          background: '#64119F',
          border: 0, borderRadius: 12,
          cursor: 'pointer',
          zIndex: 15,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        }}
      >
        다시 뽑기
      </button>
    </div>
  )
}
```

### §4 Supabase 마이그레이션 SQL (D-08 7컬럼 + 22 row INSERT)

```sql
-- File: scripts/2026MMDD_create_tarot_cards.sql
-- D-08: 메이저 아르카나 22장. 운영 메타데이터(updated_at·is_active·sort_order) 미포함 (deferred).
-- amulet_types 패턴(create_amulet_types_table.sql) 참고

CREATE TABLE IF NOT EXISTS tarot_cards (
  id INT PRIMARY KEY,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  emoji TEXT NOT NULL,
  image_path TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  message TEXT NOT NULL
);

-- RLS 정책: 모든 사용자(anon role) 읽기 가능 (Pitfall 3 회피)
ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tarot_cards_select_policy" ON tarot_cards
  FOR SELECT USING (true);

-- 22장 seed (cards.ts 라인 14-35에서 메시지 그대로 추출, "~다냥" 톤 유지)
INSERT INTO tarot_cards (id, name_ko, name_en, emoji, image_path, keywords, message) VALUES
  (0,  '바보',           'The Fool',          '🐾', '00.webp', ARRAY['시작','자유','설렘'],     '새 모험이 시작되는 날이다냥~ ...'),
  (1,  '마법사',         'The Magician',      '✨', '01.webp', ARRAY['창조','의지','재능'],     '네 안의 재능이 반짝이고 있다냥! ...'),
  -- ... 22 rows total (id 0..21)
  (21, '세계',           'The World',         '🌏', '21.webp', ARRAY['완성','성취','조화'],     '한 바퀴가 아름답게 완성되는 날이다냥~ ...')
ON CONFLICT (id) DO NOTHING;
```

**메시지 본문은 cards.ts 라인 14-35에서 그대로 추출** — 본 RESEARCH.md에서는 길어서 생략. 마이그레이션 작성 task에서 22장 전부 옮겨야 한다.

### §5 다시 뽑기 핸들러 (Phase 4 광고 wrap 지점)

```jsx
// File: src/pages/TarotPage.jsx (Pattern 1에서 발췌)
const handleRedraw = () => {
  // Phase 3 본 페이즈: 광고 없이 즉시 새 셔플
  startShuffle()
}

// Phase 4가 도입할 형태 (참고용 — 본 페이즈에서는 작성하지 않음):
// const handleRedraw = async () => {
//   const watched = await showRewardedAd()  // Phase 4 광고 모듈
//   if (watched || !adSupported) startShuffle()  // graceful degradation (ADS-03)
// }
```

### §6 햅틱 피드백 (Discretion — 사용자 결정 시 채택)

```jsx
// File: src/components/TarotShuffle.jsx (handleTap 안)
async function safeHaptic(type) {
  try {
    const { generateHapticFeedback } = await import('@apps-in-toss/web-framework')
    if (typeof generateHapticFeedback === 'function') {
      await generateHapticFeedback({ type })
    }
  } catch {
    // dev 브라우저·미지원 환경 silent fail
  }
}

const handleTap = (slotIdx) => {
  if (selectedSlot !== null) return
  safeHaptic('tap')           // 카드 선택 순간
  setSelectedSlot(slotIdx)
  setFlipping(true)
  setTimeout(() => {
    safeHaptic('tickMedium')  // 뒤집기 완료
    onSelect(cards[slotIdx].id)
  }, 700)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 카드 데이터 정적 ts 파일 (cards.ts) | Supabase `tarot_cards` 테이블 + 마이그레이션 | Phase 1 D-07 | 운영 중 메시지 수정·시즌 콘텐츠 교체 가능, 사용자별 historic 조회 확장 가능 |
| zustand 스토어 + LS persist | TarotPage useState 4종 (Phase 3) → Context 승격 (Phase 4·5) | Phase 1 GAPS 매트릭스 | DRY (fortune-cat 기존 Context 패턴 재사용), 신규 의존성 0 |
| TanStack Router 4개 라우트 | React Router DOM `/tarot` 단일 + currentPage 상태 머신 | Phase 1 D-10 + Phase 2 D-04 | SajuPage/AmuletPage 패턴 일관, 라우트 추가로 인한 토스 심사 부담 회피 |
| framer-motion 모션 | CSS keyframes/transition | Phase 3 D-02 (P1-D-08 carry-forward) | 번들 크기 축소, AIT 심사 영향 최소 |
| Tailwind v4 | inline style + (필요 시) Emotion | Phase 1 GAPS | TDS Mobile 디자인 일관성, fortune-cat 코드베이스 관행 일치 |
| 카드 이미지 PNG (D-06 가정) | `.webp` 그대로 (D-11 정정) | Phase 3 D-11 | 파일 크기 ~50% 절감, Vite 정적 import 호환 |

**Deprecated/outdated:**
- **boknyang-tarot의 `archive.tsx`**: 데일리 원카드 1종 정책으로 v1.1 제외 — 다음 마일스톤 후보.
- **`RatingWidget`/`Particles`/`Boknyang` 컴포넌트**: 본 마일스톤 outscope.
- **`lib/track.ts` (토스 eventLog)**: fortune-cat은 Firebase `logEvent` 사용 — Phase 5에서 통합.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 22장 webp 합계가 < 1MB라서 prefetch 부담 없다 | Pattern 6, Pitfall 2 | 실제 합계가 클 경우 (수 MB), intro 단계에서 background prefetch 시 첫 paint 늦어질 수 있음. 대응: lazy prefetch (intro CTA tap 후 prefetch). 본 페이즈 작업 시 `du -sh boknyang-tarot/public/cards/` 실측 권장 |
| A2 | tarot_cards 테이블이 기존 saju 백엔드 테이블과 명명 충돌 없음 | D-08, §4 | Phase 1 GAPS에서 확인 정도. 기존 supabase 프로젝트에서 `\d tarot*` 또는 Studio에서 테이블 목록 확인 필요. 충돌 시 `daily_tarot_cards` 등 prefix 변경 |
| A3 | iOS Safari < 16에서도 backface-visibility prefix가 충분 | Pitfall 1 | iOS 17/18 사용자 대다수라 영향 미미하지만, 보수적으로 prefix 유지. dev에서 실기 확인 권장 |
| A4 | `prefers-reduced-motion` 글로벌 적용이 카드 뒤집기에도 작동 | Pattern 2 | `src/index.css` 라인 92-98이 `transition-duration: 0.01ms !important`로 모든 트랜지션 단축 — rotateY 트랜지션도 자동 영향. inline style의 transition도 cascade가 적용되므로 OK |
| A5 | generateHapticFeedback이 dev 브라우저에서 throw/reject만 하지 silent crash 없음 | Pitfall 4, §6 | try/catch가 둘 다 잡으므로 안전. 단 `import('@apps-in-toss/web-framework')` 자체가 fail하는 환경(번들 분석 단계 fail)은 빌드 타임에 감지됨 |
| A6 | Supabase RLS 정책 USING(true)가 기본 anon role select를 허용한다 | §4, Pitfall 3 | Supabase 표준 동작 [CITED: supabase.com/docs/guides/auth/row-level-security]. amulet_types 마이그레이션 동일 패턴 검증됨 |
| A7 | TabBar 높이 ≈ 72px (콘텐츠 + safe-area 미포함) — fixed 버튼 bottom 계산용 | UI-SPEC §Spacing exception | TabBar.jsx 라인 161 `minHeight: 64` + paddingTop 4 + 레이블 등 ≈ 72px. UI-SPEC이 이 값으로 잠금했고 Phase 2 PLAN에서 검증된 수치. 변경 시 Phase 4·5에서도 영향 |
| A8 | 22장 카드 데이터 < 10KB (이미지 제외, JSON) | D-09 | 카드당 message ~300자 = ~600B. 22 × 600 = ~13KB. 메모리 영향 미미 |

**모든 assumption은 실행 단계에서 5분 이내로 확인 가능** — A1·A2는 task로 명시 권장.

## Open Questions

1. **햅틱 피드백 도입 여부 (Discretion 영역)**
   - What we know: `generateHapticFeedback` API 실재 + 10가지 type 지원 (`tap`, `tickMedium` 등)
   - What's unclear: 사용자가 4050 여성 대상으로 햅틱이 자연스러운지 결정 안 함
   - Recommendation: PLAN에서 별도 task로 분리해 사용자 옵션으로 제공. 채택 시 §6 코드 그대로 사용. 미채택 시 추가 작업 0
2. **22장 webp 합계 실측 여부**
   - What we know: 프로토타입 `public/cards/00.webp ~ 21.webp` 22장 존재
   - What's unclear: 합계 크기(번들 영향)
   - Recommendation: PLAN에 "이미지 복사 task 시 `du -sh src/assets/images/cards/` 출력 캡처" 단계 추가. 1MB 이상이면 lazy prefetch로 전환
3. **첫 result 표시 전 "intro 진입 직후 prefetch" 도입 여부**
   - What we know: A1 가정 + Pattern 6 prefetch 함수 제공
   - What's unclear: prefetch 부작용(첫 paint 늦어짐) vs 깜빡임 회피 가치
   - Recommendation: 채택 권장. CTA tap 직후가 아닌 intro mount 시점 prefetch가 자연 (사용자가 헤드라인 읽는 시간 동안 22장 다운로드)
4. **메시지 본문 SQL 이스케이프 처리**
   - What we know: 메시지에 작은따옴표 사용 케이스 적음(cards.ts 확인). 하지만 한국어 따옴표(`'`)는 SQL `'`와 다름
   - What's unclear: PostgreSQL `INSERT` 시 escape 필요 여부
   - Recommendation: 안전하게 `$$ ... $$` dollar-quoted string 사용. 또는 Supabase Studio Table Editor로 22행 직접 입력 후 SQL export
5. **fetchTarotCards 캐시 정책**
   - What we know: 매 세션 새 카드(D-04)지만 22장 전체 데이터는 매번 다시 받을 필요 없음
   - What's unclear: 페이지 navigate 후 재진입 시 다시 fetch할지 캐시할지
   - Recommendation: 본 페이즈는 단순 매번 fetch (사용자가 짧은 시간에 여러 번 진입할 가능성 낮음). 추후 성능 이슈 시 모듈 레벨 캐시 변수 추가

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (Vite dev/build) | 모든 task | ✓ (granite dev / ait build) | — | — |
| @supabase/supabase-js | fetchTarotCards | ✓ | 2.86.0 [VERIFIED: package.json] | — |
| @toss/tds-mobile (`Loader` export) | intro 로딩 스피너 | ✓ | 2.1.2 [VERIFIED: TDS d.ts] | inline div spinner |
| @apps-in-toss/web-framework (`generateHapticFeedback`) | 햅틱 (Discretion) | ✓ | 2.4.5 [VERIFIED: web-bridge d.ts] | silent fail (try/catch) — dev 브라우저 |
| Supabase 인스턴스 (운영 프로젝트) | 마이그레이션 적용 | ✓ (이미 saju.trinity-apps.net 백엔드 사용 중) | — | dev 브랜치 supabase 프로젝트 또는 Studio Table Editor 직접 입력 |
| boknyang-tarot/public/cards/00-21.webp | 이미지 복사 task | ✓ | — | (if 손실) cards.ts 메시지 기반 placeholder 이미지 생성 |
| boknyang-tarot/src/data/cards.ts | seed 텍스트 추출 | ✓ | — | — |
| Sentry DSN (`VITE_SENTRY_DSN`) | fetch 실패 시 captureException | ✓ (production만, dev는 조건부 init) | — | console.error만 |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None (모두 필수 dep 확보).

## Validation Architecture

본 프로젝트 `.planning/config.json`의 `workflow.nyquist_validation: true` 확인 — 본 섹션 포함.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **현재 미구성** — fortune-cat에는 자동화된 단위/통합 테스트 인프라가 없음 (package.json scripts에 test 없음, jest/vitest 미설치) |
| Config file | none |
| Quick run command | `npm run lint` (ESLint 9.25.0 — JSX·React Hooks 규칙 검증) |
| Full suite command | `npm run lint && npm run build` (lint + Vite build success로 회귀 검출) |

**현실 인정:** fortune-cat은 v1.0이 운영 중이지만 자동화 테스트 인프라가 없다. 본 페이즈에서 vitest/jest를 도입하는 것은 **Phase 3 스코프 외**다 (Discretion·CONTEXT 모두 언급 없음, 신규 의존성 금지 D-02 carry-forward와 충돌). 따라서 Validation Architecture는 ESLint + Vite build + 수동 검증으로 구성한다.

### Phase 요구사항 → 검증 매트릭스

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TAROT-01 | intro → shuffle 부채꼴 → 1장 탭 → 뒤집기 → result 진입 | manual + lint | `npm run lint`, `npm run build` | ✅ (build·lint 인프라) |
| TAROT-01 | 22장 fetch 성공 시 부채꼴 3장 노출 | manual (Vite dev) | `npm run dev` 후 `/tarot` 진입 | ✅ |
| TAROT-01 | 22장 fetch 실패 시 에러 화면 + 재시도 버튼 | manual (Supabase URL 일부 일시 차단) | — | manual |
| TAROT-02 | 결과 화면에 카드 이미지·이름·해석 동시 표시 | manual + UI-SPEC checker | (UI-SPEC 시각 검수) | ✅ (03-UI-SPEC.md 체크리스트) |
| TAROT-02 | 4050 가독성: 본문 16px / 1.6 / WCAG AA contrast | manual + UI-SPEC Checker | (UI-SPEC Checker Sign-Off) | ✅ |
| TAROT-03 | 다시 뽑기 클릭 → shuffle 새 3장 | manual | `npm run dev` 후 다시 뽑기 클릭 5회 (다른 카드 노출 확인) | ✅ |
| TAROT-03 | 다시 뽑기 버튼이 탭바 가리지 않음 | manual + UI-SPEC | (UI-SPEC §Spacing exception) | ✅ |
| (D-10) | fetch 에러 시 Sentry.captureException 호출 | manual (Sentry dashboard 확인) | — | manual |
| (D-02) | 카드 뒤집기 60fps (jank 없음) | manual (Chrome DevTools Performance) | — | manual |
| (D-09) | intro fetch 진행 중 `<Loader />` 노출 | manual + lint | `npm run dev` slow network throttling | ✅ |

### Sampling Rate

- **Per task commit:** `npm run lint` (ESLint 통과 강제)
- **Per wave merge:** `npm run lint && npm run build` (Vite 빌드 성공으로 import 누락·circular dep 검출)
- **Phase gate:** 위 자동 검증 + UI-SPEC Checker Sign-Off 완료 + 수동 디바이스 테스트(`/tarot` 흐름 일순 + 다시 뽑기 5회)

### Wave 0 Gaps

- [ ] **(없음 — 본 페이즈는 신규 테스트 인프라 도입 안 함)**

본 페이즈에서 도입하지 않는 것을 명시:
- vitest/jest 도입 → **본 페이즈 outscope.** 향후 마일스톤에서 별도 결정.
- React Testing Library / Playwright → 동일하게 outscope.

대신 본 페이즈가 갖춘 보호장치:
- ESLint(react-hooks·react-refresh) → useEffect cleanup 누락·hook 룰 위반 감지
- Vite production build → import 누락·circular dep·번들 크기 회귀 감지
- UI-SPEC Checker (03-UI-SPEC.md Checker Sign-Off 6 dimensions) → 시각·copy·color·typography·spacing·registry 자동 검수
- Sentry production runtime → 실배포 후 fetch 실패·rendering 에러 자동 수집

**왜 자동 테스트 미도입:** (1) Phase 3 CONTEXT/Discretion 모두 언급 없음, (2) D-02 신규 의존성 금지, (3) v1.0 코드도 자동 테스트 없이 운영 중 — 본 페이즈만 테스트 도입은 비대칭. 향후 마일스톤에서 v1.0 + v1.1 통합 테스트 마이그레이션 시 통째로 도입 권장.

## Sources

### Primary (HIGH confidence)
- `/Users/trinity/Projects/app-in-toss/fortune-cat/.planning/phases/03-daily-one-card-core/03-CONTEXT.md` — D-01~D-11 잠금 결정 (전체 11종)
- `/Users/trinity/Projects/app-in-toss/fortune-cat/.planning/phases/03-daily-one-card-core/03-UI-SPEC.md` — Spacing/Typography/Color/Animation/Layout/Copywriting 6 dimensions 명세
- `/Users/trinity/Projects/app-in-toss/fortune-cat/.planning/phases/01-tarot-prototype-evaluation/01-INVENTORY.md` — boknyang-tarot 자산 매핑
- `/Users/trinity/Projects/app-in-toss/fortune-cat/.planning/phases/01-tarot-prototype-evaluation/01-GAPS.md` — 갭 매트릭스(스타일·상태·언어·UI·라우팅·모션)
- `/Users/trinity/Projects/app-in-toss/fortune-cat/.planning/phases/02-tab-bar-navigation-shell/02-CONTEXT.md` — Phase 2 carry-forward (P2-D-04 단일 라우트, P2-D-05 탭바 표시)
- `/Users/trinity/Projects/app-in-toss/fortune-cat/.planning/REQUIREMENTS.md` — TAROT-01/02/03 정의
- `/Users/trinity/Projects/app-in-toss/fortune-cat/.planning/ROADMAP.md` — Phase 3 4 Success Criteria
- `/Users/trinity/Projects/app-in-toss/fortune-cat/.planning/STATE.md` — 프로젝트 진행 상태
- `/Users/trinity/Projects/app-in-toss/fortune-cat/CLAUDE.md` — 프로젝트 제약(Tech stack, Auth, Build, Repository layout)
- `/Users/trinity/Projects/app-in-toss/fortune-cat/package.json` — 의존성 버전 직접 확인
- `/Users/trinity/Projects/app-in-toss/fortune-cat/src/pages/HomePage.jsx` (라인 88-130, 307-352) — Promise.all + setHasError + Loader 패턴
- `/Users/trinity/Projects/app-in-toss/fortune-cat/src/pages/TarotPage.jsx` — Phase 2 placeholder (currentPage useState만)
- `/Users/trinity/Projects/app-in-toss/fortune-cat/src/components/TabBar.jsx` (라인 130-137, 161) — 탭바 높이 계산 (~72px) + safe-area 패턴
- `/Users/trinity/Projects/app-in-toss/fortune-cat/src/components/Result.jsx` (라인 200-260) — 결과 메시지 카드 + fixed 버튼 패턴
- `/Users/trinity/Projects/app-in-toss/fortune-cat/src/lib/supabase.js` (라인 86-117) — KST 변환 + select 패턴
- `/Users/trinity/Projects/app-in-toss/fortune-cat/src/index.css` (라인 1-98) — CSS 변수 토큰 + prefers-reduced-motion 글로벌
- `/Users/trinity/Projects/app-in-toss/fortune-cat/src/App.jsx` — Phase 2 결과: `/tarot` 라우트 + TabBar 형제 배치 확인
- `/Users/trinity/Projects/app-in-toss/fortune-cat/scripts/create_amulet_types_table.sql` — 마이그레이션 + RLS 정책 패턴
- `/Users/trinity/Projects/app-in-toss/fortune-cat/node_modules/@apps-in-toss/web-bridge/dist/generateHapticFeedback.d.ts` — Haptic API 시그니처 직접 검증
- `/Users/trinity/Projects/app-in-toss/fortune-cat/node_modules/@toss/tds-mobile/dist/esm/index.d.ts` — `Loader` export 직접 검증
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/components/TarotCardArt.tsx` — 포팅 원본
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/routes/shuffle.tsx` — 부채꼴 패턴 원본
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/routes/result.tsx` — flip 패턴 원본
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/data/cards.ts` — 22장 seed 텍스트 원본

### Secondary (MEDIUM confidence)
- MDN Web Docs — `backface-visibility` browser compat (iOS Safari prefix 정보) [CITED]
- MDN Web Docs — `transform-style: preserve-3d` (3D 합성 컨텍스트) [CITED]
- Vite Static Asset Handling docs — `.webp` 정적 import 지원 [CITED]
- Wikipedia — Fisher-Yates shuffle 알고리즘 [CITED]
- Supabase Row Level Security 표준 동작 [CITED: supabase.com/docs/guides/auth/row-level-security]

### Tertiary (LOW confidence)
- 없음 (모든 claim이 검증 또는 인용으로 뒷받침됨)

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — 모든 의존성을 package.json + node_modules d.ts 직접 검증
- Architecture: **HIGH** — CONTEXT/UI-SPEC이 거의 모두 잠금. 본 RESEARCH는 코드 패턴화만
- Pitfalls: **HIGH** — 7건은 Phase 1·2 산출물·기존 fortune-cat 코드에서 검증된 사례, 1건(Pitfall 1)은 MDN 인용
- Test infra: **MEDIUM** — 자동 테스트 미도입 결정은 보수적 (Phase 3 scope 외), Wave 0 Gaps None으로 명시
- 햅틱 피드백 채택 여부: **LOW** — 사용자 결정 필요 (Discretion 영역, A5에 명시)

**Research date:** 2026-05-02
**Valid until:** 2026-08-02 (3개월) — fortune-cat 의존성·Phase 1·2 산출물이 안정 상태이므로 단기 변동 가능성 낮음. Phase 4·5 진입 시 Phase 3 결정의 carry-forward 범위가 다시 검증되어야 함.

---

*Phase: 03-daily-one-card-core*
*Research written: 2026-05-02*
*Generator: gsd-researcher (standalone — `/gsd-research-phase`)*
