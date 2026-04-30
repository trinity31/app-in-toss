# Phase 1: 포팅 갭 매트릭스 (Gap Matrix)

**Created:** 2026-04-30
**Source prototype:** `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/`
**Target codebase:** `/Users/trinity/Projects/app-in-toss/fortune-cat/`
**Decisions referenced:** D-08, D-09, D-10 (see `01-CONTEXT.md`)
**색상 분류 규칙 (CONTEXT specifics):** 🔴 라우팅 / 🟡 스타일·언어·상태·UI / 🟢 모션·아이콘

> 본 문서는 외부 프로토타입과 fortune-cat의 스택·의존성·라우팅 충돌을 강도 표시(🔴/🟡/🟢)·해결 전략과 함께 매트릭스로 제공합니다. Phase 2~5 플래너가 의존성 재구현 전략을 표 한 장으로 즉시 참조할 수 있도록 작성했습니다. 평가/문서화 전용으로 소스 코드 변경은 없습니다.

---

## 갭 매트릭스

| 충돌 영역 | 프로토타입 측 | fortune-cat 측 | 충돌 강도 | 해결 전략 | 관련 D-XX |
|-----------|---------------|----------------|-----------|-----------|-----------|
| **라우팅** | TanStack Router (`@tanstack/react-router` ^1.168.0) + `routeTree.gen.ts` 자동 생성 + 4 라우트 파일(`__root`/`index`/`shuffle`/`result`/`archive`) | React Router DOM 7.9.5 (이미 설치) + `currentPage` 상태 머신 패턴 (`SajuPage`, `AmuletPage`, `NewYearPage`) | 🔴 | 라우트 파일을 직접 포팅하지 않고 **`TarotPage.jsx` 단일 라우트 + 내부 `currentPage` 상태(`intro` → `shuffle` → `result`)** 로 재구성한다. `__root.tsx`(셸 + BottomNav 렌더 + zustand `hydrate()`)는 `App.jsx` Provider 구조 + Phase 2 탭바 셸로 흡수. **신규 `/tarot` 라우트 추가 금지** (PROJECT.md). `archive`는 Out-of-scope이라 포팅 안 함. | D-10 |
| **스타일링** | Tailwind v4 (`tailwindcss` ^4.2.4, `@tailwindcss/vite`, `tailwind-merge` ^3.5.0, `clsx` ^2.1.1, `class-variance-authority` ^0.7.1) + oklch 색상 + 커스텀 CSS 변수(`--color-lavender`, `--shadow-soft`, `--shadow-card` 등) | Emotion (`@emotion/react` 11.14.0) + TDS Mobile 토큰 + inline `style={{ }}` 패턴 | 🟡 | Tailwind 유틸 클래스(`flex`, `min-h-screen`, `text-2xl` 등)를 Emotion `css` prop / styled 컴포넌트로 재작성. `clsx`/`tailwind-merge`/`class-variance-authority`는 도입하지 않음 (DRY + AIT 심사 영향 최소화). 색상·간격은 **TDS 토큰 우선**, 부족 시 Emotion inline 정의. oklch 값은 그대로 옮기되, 가능하면 TDS 색상 팔레트로 매핑. `lib/utils.ts`의 `cn()`은 Tailwind 미사용으로 자연 소거. | D-08 |
| **상태 관리** | zustand ^5.0.12 (`src/store/tarot.ts` — `history`/`hydrate`/`todayDraw`/`recordDraw`/`pickRandomCardId`) + localStorage 키 `boknyang.history.v1` | React Context API + `useState` (현재 `SessionContext`/`ToastContext`/`AnonymousKeyContext` 패턴) + Toss `Storage`(`useUserInfoStorage`/`usePendingOrderStorage`) | 🟡 | `tarot.ts` 스토어 슬라이스를 **`TarotPage` 내부 `useState`** 또는 **신규 `TarotContext.jsx`** (전역 필요 시)로 재구현. 신규 의존성 추가 없음(D-08). LS 키는 `fortunecat.tarot.history.v1` 등 fortune-cat 네임스페이스로 변경. 정확한 위치(local state vs Context)는 Phase 3에서 결정. | D-08 |
| **UI 프리미티브** | Radix UI (`@radix-ui/react-dialog` ^1.1.15, `@radix-ui/react-label` ^2.1.8, `@radix-ui/react-separator` ^1.1.8, `@radix-ui/react-slot` ^1.2.4, `@radix-ui/react-toggle` ^1.1.10, `@radix-ui/react-tooltip` ^1.2.8) + `lucide-react` ^0.460.0 아이콘(`Sparkles`/`ChevronLeft`/`Home`/`Share2`/`X`/`BookHeart`/`Star`/`ChevronDown`) | TDS Mobile (`@toss/tds-mobile` 2.1.2, `@toss/tds-mobile-ait` 2.1.2) + `@toss/tds-colors` — 이미 사용 중 | 🟡 | Radix 컴포넌트는 **데일리 원카드 흐름에서 실제로 사용된 것만** TDS Mobile 카탈로그로 1:1 매칭 후 재작성(현재 인벤토리 분석상 데일리 원카드 흐름은 Radix를 직접 import하지 않음 — `RatingWidget`/`archive` 등 Out-of-scope에 집중되어 있음). 매칭 어려운 컴포넌트는 Emotion + 기본 HTML로 폴백. **`lucide-react` 아이콘은 도입하지 않고** TDS 아이콘 또는 카드 이미지·이모지로 대체. | D-08 |
| **언어** | TypeScript (`typescript` ~5.7.2, `.ts`/`.tsx`, `tsconfig.{app,node}.json`, `@types/react` 등) | JavaScript (`.js`/`.jsx`) — TS 미사용, ESLint만 (eslint.config.js) | 🟡 | TS 코드를 JSX로 변환 — 타입 어노테이션 제거, `interface`/`type` → JSDoc 주석. 제네릭 zustand `create<TarotState>` 같은 타입 인자는 자연 소거. `cards.ts`는 Supabase 데이터로 이전(D-07)되므로 변환 대상 아님. `TarotCardArt.tsx`의 `Props`/`SIZES` 타입은 JSDoc 또는 PropTypes(필요 시) 처리. | D-08 |
| **모션** | `framer-motion` ^12.38.0 — 카드 뒤집기(rotateY 180°)·셔플 애니메이션·`Particles`·이모지 spring 애니메이션 | 미도입 — TDS 기본 트랜지션 + 일부 inline transition(`transition: 'transform 0.2s ease'` 등)만 사용 | 🟢 | **Phase 1에서 결정하지 않는다 (D-09).** Phase 2(탭바) 또는 Phase 3(데일리 원카드)에서 "TDS 기본 트랜지션 + CSS keyframes(rotateY)로 카드 뒤집기 가능 여부"를 우선 검토한 뒤, 불가피한 경우에만 도입한다. `Particles`는 Out-of-scope이므로 모션 의존도가 낮음. AIT 심사 영향(번들 크기·신규 의존성) 점검 필수. | D-09 |
| **카드 데이터 위치** | `src/data/cards.ts` 정적 import (22장 메이저 아르카나 + `getCardById`) | (없음 — Supabase 메뉴 테이블 패턴) | 🟡 | **Supabase `tarot_cards` 테이블로 이전(D-07).** `ai_saju_types`·`amulet_types` 등 메뉴 테이블 조회 패턴(`src/lib/supabase.js`) 그대로 재사용. 운영 중 메시지 수정/시즌 콘텐츠 교체 가능, 향후 주제별·스프레드 확장 시 같은 테이블 모델로 확장. 정확한 스키마(권장 컬럼: `id`, `name_ko`, `name_en`, `emoji`, `image_path`, `keywords` text[], `message`)는 Phase 3 마이그레이션에서 확정. | D-07, D-08 |
| **카드 이미지 형식** | `public/cards/00.webp ~ 21.webp` (WebP) | `src/assets/images/`에 PNG만 존재 | 🟢 | **Phase 3 자산 복사 시점에 결정(CONTEXT deferred 항목).** WebP 그대로 유지(파일 크기 이점) vs PNG 변환(기존 형식 일관성) 트레이드오프. CONTEXT.md D-06은 `.png` 가정이지만 실제 파일은 `.webp`이므로 명시적 결정 필요. AIT 빌드(Vite 정적 import)에서 양 형식 모두 지원되므로 기능적 차단은 없음. | D-06 |
| **AIT 빌드 설정** | `granite.config.ts` — `appName: "boknyang-tarot"`, `permissions: []`, `host: localhost`, dev 명령 `vite dev` | `granite.config.ts` — `appName: 'fortune-cat'`, `permissions: [camera, photos]`, `host: 192.168.0.28`, `bridgeColorMode: basic`, `navigationBar: { withBackButton, withHomeButton }`, dev 명령 `vite --host` | 🟢 | fortune-cat의 `granite.config.ts`를 **변경하지 않음**(타로는 별도 라우트 추가 없이 탭바로 통합되므로 권한·설정 변경 불필요). PROJECT.md 제약: `granite.config.ts` 권한 변경 시 토스 심사 영향 검토 — 본 마일스톤에서는 변경 없음. boknyang-tarot의 `permissions: []`은 fortune-cat의 기존 카메라/앨범 권한과 무관. | (해당 없음 — 영향 미미) |

---

## 충돌 강도 요약

### 🔴 차단성 충돌 (Critical)

- **라우팅 (1건)** — TanStack Router → React Router DOM + `currentPage` 상태 머신.
- **조치:** Phase 2/3 시작 전 반드시 단일 라우트 + `currentPage` 패턴으로 합의 완료. PROJECT.md "별도 `/tarot` 라우트 추가 금지" 제약과 부합.

### 🟡 변환 필요 충돌 (Significant)

- **스타일링** (Tailwind → Emotion + TDS Mobile)
- **상태 관리** (zustand → React Context + `useState`)
- **UI 프리미티브** (Radix UI → TDS Mobile / 기본 HTML 폴백)
- **언어** (TypeScript → JavaScript/JSX)
- **카드 데이터 위치** (정적 `cards.ts` → Supabase `tarot_cards`)
- **조치:** 각 의존성을 fortune-cat 패턴으로 재구현 — **신규 의존성 추가 없음 (D-08)**. TDS Mobile/AIT 디자인 일관성 + AIT 심사 영향 최소화.

### 🟢 결정 보류 / 영향 미미 (Low)

- **모션 (1건)** — `framer-motion` 도입 보류 (D-09). Phase 2/3에서 TDS 기본 트랜지션 + CSS keyframes 우선 검토 후 결정.
- **카드 이미지 형식** — WebP 유지 vs PNG 변환 (Phase 3 결정).
- **AIT 빌드 설정** — 변경 없음 (권한·라우트 추가 없음).

---

## 신규 의존성 정책

- **TDS Mobile/AIT 디자인 일관성 + AIT 심사 영향 최소화**를 위해 **신규 의존성 추가 없음** 원칙 (D-08).
- 갭 매트릭스의 모든 🟡 항목은 fortune-cat 기존 의존성으로 재구현한다:
  - Tailwind/`clsx`/`tailwind-merge`/`class-variance-authority` → **Emotion** (`@emotion/react` 11.14.0, 이미 설치)
  - `zustand` → **React Context API + `useState`** (이미 사용 중인 `SessionContext`/`ToastContext`/`AnonymousKeyContext` 패턴)
  - `@radix-ui/*` → **TDS Mobile** (`@toss/tds-mobile` 2.1.2, 이미 설치)
  - `lucide-react` → TDS 아이콘 또는 카드 이미지/이모지로 대체 (이미 fortune-cat이 이모지 활용)
  - `@tanstack/react-router` → **React Router DOM** 7.9.5 (이미 설치)
  - TypeScript → JSX (현재 빌드 체인 그대로)
- **예외:** `framer-motion` 만 Phase 2/3에서 별도 검토 (D-09) — TDS 기본 트랜지션 + CSS keyframes로 불가피한 경우에만 도입.

---

## 후속 페이즈 영향

각 후속 페이즈가 본 갭 매트릭스의 어느 항목과 직접 연관되는지 표시한다.

- **Phase 2 (하단 탭바 셸):**
  - 라우팅 (🔴) — `App.jsx` 위에 탭바 셸 얹기, BottomNav 패턴 참고하되 TDS Mobile로 재구현.
  - UI 프리미티브 (🟡) — `BottomNav.tsx` → TDS Mobile 탭바.
  - 모션 (🟢) — 탭 전환 트랜지션 (TDS 기본으로 가능 여부 검토).
- **Phase 3 (데일리 원카드 코어):**
  - 스타일링 (🟡) — Tailwind → Emotion 전환 (`TarotCardArt`/`ShufflePage`/`ResultPage`).
  - 상태 관리 (🟡) — zustand `useTarotStore` → `useState` 또는 `TarotContext`.
  - 언어 (🟡) — `TarotCardArt.tsx` → `TarotCardArt.jsx`.
  - 모션 (🟢) — 카드 뒤집기(rotateY 180°)·셔플 부채꼴 애니메이션 — framer-motion 도입 여부 본 페이즈에서 결정 (D-09).
  - 카드 데이터 위치 (🟡) — `src/data/cards.ts` → Supabase `tarot_cards` 마이그레이션 + 22장 seed.
  - 카드 이미지 형식 (🟢) — WebP 유지 vs PNG 변환 결정.
- **Phase 4 (광고 게이팅):**
  - 갭 항목 직접 영향 적음 — fortune-cat의 `Loading.jsx`/`DeepReadingLoading.jsx` 광고 게이팅 패턴 재사용.
- **Phase 5 (Analytics·공유):**
  - 갭 항목 직접 영향 적음 — `lib/track.ts` Out-of-scope, fortune-cat `logEvent`(`src/lib/firebase.js`) 사용. `getTossShareLink` + `appsShare` 공유 로직만 fortune-cat 토스 공유 시트 패턴과 통합.

---

*Phase: 01-tarot-prototype-evaluation*
*Plan: 01 (Asset inventory + Gap matrix)*
*Gap matrix written: 2026-04-30*
