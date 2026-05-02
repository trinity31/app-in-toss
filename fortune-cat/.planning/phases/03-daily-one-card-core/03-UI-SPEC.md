---
phase: 3
slug: daily-one-card-core
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-02
---

# Phase 3 — UI Design Contract: 데일리 원카드 코어 화면

> 타로 탭(`/tarot`) 안에서 사용자가 카드 뒷면 확인 → 부채꼴 3장 중 1장 선택 → 뒤집기 애니메이션 → 결과 화면(카드 이미지·이름·해석) → 다시 뽑기로 이어지는 데일리 원카드 흐름의 시각·인터랙션 계약. Phase 2가 만든 `TarotPage.jsx`(`/tarot` 라우트, 빈 컨테이너, `currentPage` 상태) 위에 `'intro' → 'shuffle' → 'result'` 단계를 채워 넣는다.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (shadcn 미사용 — 프로젝트 기존 관행 유지) |
| Preset | not applicable |
| Component library | TDS Mobile (`@toss/tds-mobile` 2.1.2, `@toss/tds-mobile-ait` 2.1.2) — `Loader` 우선, 부재 시 inline-style fallback |
| Icon library | none — 아이콘은 SVG path 자체 정의 또는 카드 이모지 그대로 (Phase 1 D-08 신규 의존성 금지 carry-forward) |
| Font | system (`--font-sans: 'Inter', system-ui, -apple-system, sans-serif` — `src/index.css` 정의 그대로) |
| Color tokens | fortune-cat CSS variables (`var(--color-primary)`, `var(--color-gray-*)`, `var(--color-white)`) + `@toss/tds-colors` (`colors.blue500`, `colors.grey300`) |
| Styling approach | React inline style (HomePage·SajuPage·AmuletPage·TabBar 일관). Emotion `css` prop 사용은 보류 — 신규 도입 시점은 별도 페이즈. |
| Animation | CSS transform/transition + `@keyframes` (Phase 3 D-02). framer-motion 도입 금지. |

**근거:** `components.json` / Tailwind 설정 부재 확인됨. `package.json` 기준 기존 스택 = TDS Mobile + Emotion + 인라인 스타일. CONTEXT D-02가 "신규 의존성 금지" 재확인.

---

## Spacing Scale

8-point scale (multiples of 4):

| Token | Value | Usage in Phase 3 |
|-------|-------|------------------|
| xs | 4px | 카드 키워드 chip 내부 좌우 패딩 보정, NEW 배지 미세 정렬 |
| sm | 8px | 키워드 chip 사이 가로 간격, 카드 이름 옆 점(·) 좌우 |
| md | 16px | intro 본문 ↔ CTA 사이, 결과 화면 카드 ↔ 헤더 사이 (행간 그룹) |
| lg | 24px | 결과 화면 헤더(이모지+이름) ↔ 키워드 chip 그룹 사이, 키워드 ↔ 메시지 카드 사이, intro 일러스트 ↔ 헤드라인 사이 |
| xl | 32px | 결과 카드 이미지 위 상단 여백, intro 컨테이너 좌우 padding(현재 `padding: 24` → 24/32 혼용 허용) |
| 2xl | 48px | shuffle 단계 부채꼴 컨테이너 상단 여백 (헤더 바로 아래) |
| 3xl | 64px | 결과 화면 메시지 카드 ↔ 다시 뽑기 버튼 사이 spacer (탭바·safe-area 회피용 — 정확한 값은 아래 "Layout — Result" 참조) |

**Exceptions:**
- **다시 뽑기 버튼 fixed 영역 하단:** `paddingBottom: calc(24px + env(safe-area-inset-bottom))` — 기존 `Result.jsx` 라인 246 패턴(`16px 20px calc(24px + env(safe-area-inset-bottom))`)과 동일 (safe-area 보정).
- **다시 뽑기 버튼이 탭바 위로 떠 있는 절대 위치:** `bottom: calc(72px + env(safe-area-inset-bottom) + 8px)` — 탭바 높이(`minHeight: 64` + `paddingTop: 4` + `paddingBottom: env(safe-area-inset-bottom)+8` ≈ 72px 콘텐츠 + safe-area) 바로 위에 8px gap 두고 띄움.
- **카드 부채꼴 horizontal overlap:** D-01 "살짝 겹침" — 부채꼴 좌/우 카드 `translateX(±64px)` (4px 그리드 정렬). 카드 너비(`md` size = 120px) 대비 약 53% 노출 = 양쪽이 중앙 카드와 ~56px 겹침.

---

## Typography

본 페이즈에서 선언하는 4 사이즈 × **허용 weight 2종 (400 regular / 700 bold)** 매트릭스 (4050 가독성 우선 — body 16-17px, line-height 1.5-1.6):

| Role | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display (카드 이름) | 24px | 700 (bold) | 1.3 | 결과 화면 `이모지 한국어명 (영문명)` 헤더 한 줄 |
| Heading (intro 헤드라인) | 20px | 700 (bold) | 1.3 | intro `오늘의 한 장을 만나보세요` / shuffle 안내 문구 / 에러 헤드라인 |
| Body (카드 메시지·일반 본문) | 16px | 400 (regular) | 1.6 | 결과 카드 메시지 ~300자, intro 부제 본문 |
| Body Strong (CTA 라벨) | 16px | 700 (bold) | 1.3 | intro `오늘의 한 장 뽑기` 버튼 라벨, result `다시 뽑기` 버튼 라벨, 에러 `다시 시도하기` 버튼 라벨 |
| Label (chip·메타) | 14px | 700 (bold) | 1.4 | 키워드 chip 텍스트, 로딩/에러 보조 캡션, result 카드 메타("오늘의 한 장") |

**허용 weight 매트릭스 (강제):**
- **400 (regular):** Body 본문(16px / 1.6)에만 사용 — 긴 본문 가독성 확보.
- **700 (bold):** Display, Heading, Body Strong, Label 전부에 사용 — 헤더·CTA·chip·메타 모두 통일.
- **600 semibold·500 medium·기타 weight 일체 금지.** 본 페이즈 어떤 element도 400/700 외 weight 사용 금지 (chip, label, button, meta, caption 포함).

**근거:**
- 본 페이즈 specifics "메시지 본문 16-17px, 줄간격 1.5-1.6" → body 16px / 1.6 채택 (4050 가독성).
- `Result.jsx` 기존 패턴: 본문 `fontSize: 16px, lineHeight: 1.8` / 헤드 `fontSize: 24px, fontWeight: bold`. 본 페이즈는 카드 메시지 길이가 ~300자로 짧으므로 line-height 1.6으로 살짝 좁힘(스크롤 없이 한 페이지 들어가기 위함).
- 영문명(`The Star` 등)은 한국어명과 동일 사이즈로, 대신 색상으로 약화(아래 Color 참조).
- **Label·CTA를 700으로 통일 — fortune-cat 기존 CTA·헤더 weight 일관성(`Result.jsx`·`HomePage.jsx`·`TabBar.jsx`가 활성 라벨/CTA에 700 사용) + 4050 가독성 향상(작은 14px chip·meta가 600보다 700에서 명확히 인지됨). 결과적으로 본 페이즈 전체가 400/700 두 weight만으로 위계를 표현.**

**금지:**
- 위 5종 외 신규 사이즈 도입 금지 (예: 12px 보조 텍스트, 28px display 등). 변형이 필요하면 5종 안에서 색상·여백으로 위계 표현.
- `font-style: italic` 미사용 (Korean fonts에서 약함).
- `font-weight: 500 / 600 / 800 / 900` 일체 금지 (400 / 700만 허용).

---

## Color

fortune-cat 기존 토큰 60/30/10 분배 (보라색 계열 브랜드 + 그레이 중립):

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `var(--color-white)` (`#FFFFFF`) | 모든 단계의 배경. intro/shuffle/result 전체 페이지 surface |
| Secondary (30%) | `var(--color-primary-light)` (`#F4E6FF`) | 결과 화면 메시지 본문을 감싸는 카드 배경, 키워드 chip 배경. (기존 `Result.jsx` 라인 203 메시지 카드 패턴 동일) |
| Accent (10%) | `var(--color-primary)` (`#64119F`) | **다시 뽑기 버튼 배경 (1차 CTA), intro 카드 뽑기 버튼 배경, 키워드 chip 텍스트, 영문명 텍스트** — 그 외에는 사용 금지 |
| Text primary | `var(--color-gray-700)` (`#191F28`) | 카드 한국어명, 메시지 본문, intro 헤드라인 |
| Text secondary | `var(--color-gray-500)` (`#6B7684`) | intro 부제, 로딩 캡션, 카드 메타("오늘의 한 장") |
| Text on accent | `var(--color-white)` (`#FFFFFF`) | 다시 뽑기/카드 뽑기 버튼 위 라벨 |
| Border (subtle) | `var(--color-gray-200)` (`#E5E8EB`) | 메시지 카드 내부 구분선 (사용 시), 다시 뽑기 fixed 영역 상단 hairline (탭바와 시각 분리) |
| Destructive | not used | 본 페이즈에는 파괴적 액션 없음 (다시 뽑기는 비파괴) |

**Accent reserved for (10% 룰 — 명시적 리스트):**
1. intro 단계 `오늘의 한 장 뽑기` 버튼 배경
2. shuffle 단계 (선택 후 활성화되는 경우) confirm 버튼 — 본 페이즈는 D-01에 따라 "탭=즉시 뒤집기"로 confirm 단계 없음. **사용 안 함.**
3. result 단계 `다시 뽑기` 버튼 배경
4. result 단계 카드 영문명(`The Star` 등) 텍스트 색상 — 한국어명과 시각 구분 위함
5. result 단계 키워드 chip 텍스트 (`#시작`, `#자유` 등) — chip 배경은 `--color-primary-light`

**금지:**
- `--color-primary`를 본 페이즈 어떤 위치에도 위 5개 외에 사용 금지 (테두리, 일반 아이콘, 호버 등). 강조가 필요하면 weight 700 또는 `--color-gray-700` 사용.
- 프로토타입의 `oklch(...)`·라벤더 그라디언트는 **카드 뒷면/앞면 framed 매트 안쪽에서만** 사용 허용 (외부로 새지 않음 — 카드 컴포넌트 캡슐화).
- 다크 모드 미지원 (fortune-cat v1.x 일관 — `body` 강제 light).

**Contrast (WCAG AA 4.5:1 검증):**
- `#191F28` on `#FFFFFF` = 16.6:1 ✓
- `#6B7684` on `#FFFFFF` = 4.85:1 ✓ (AA pass, 본문 14px+에서)
- `#FFFFFF` on `#64119F` = 9.5:1 ✓
- `#64119F` on `#F4E6FF` = 8.7:1 ✓ (키워드 chip)

---

## Layout — 단계별 시각 구조

### intro 단계

```
┌──────────────────────────────────┐
│  [TabBar 위쪽 컨텐츠 영역]       │
│                                  │
│  (top: 96px / safe-area-top)     │
│                                  │
│       ┌─────────┐                │
│       │  카드    │  ← 카드 뒷면 1장 (size "lg" = 200x300)
│       │  뒷면    │     중앙 정렬, 카드 위 32px 위 lift shadow
│       │  preview│                │
│       └─────────┘                │
│         (32px gap)               │
│   오늘의 한 장을                  │  ← Display 24px / 700, gray-700
│   만나보세요                     │
│         (16px gap)               │
│   카드를 한 장 뒤집어             │  ← Body 16px / 400, gray-500
│   오늘의 메시지를 받아보세요     │     줄바꿈 허용, 가운데 정렬
│         (32px gap)               │
│   ┌────────────────────────┐     │
│   │   오늘의 한 장 뽑기     │     │  ← Primary CTA, 폭 100%, 높이 56px
│   └────────────────────────┘     │     배경 --color-primary, 텍스트 Body Strong (16px / 700 / white), radius 12px
│                                  │
│  (bottom: 탭바 + safe-area)      │
└──────────────────────────────────┘
```

- **Vertical centering:** intro 콘텐츠는 `flex column + justifyContent: center` (TarotPage 빈 컨테이너 현재 패턴 유지).
- **카드 뒷면 preview 배치:** 클릭 가능 영역 아님 (탭하면 shuffle로 진행하는 게 아니라 아래 CTA 버튼만 진행). 시각 미리보기 역할.
- **CTA 버튼 위치:** intro 단계는 fixed 아닌 일반 흐름. 콘텐츠와 함께 중앙 정렬.

### shuffle 단계

```
┌──────────────────────────────────┐
│  (top: 48px)                     │
│   세 장 중 한 장을                 │  ← Heading 20px / 700, gray-700
│   골라보세요                     │     가운데 정렬
│         (16px gap)               │
│   탭하면 그 자리에서 뒤집혀요    │  ← Body 16px / 400, gray-500
│         (48px gap)               │
│                                  │
│      ╱┌──┐  ┌──┐  ┌──┐╲          │  ← 카드 3장 부채꼴 (size "md" = 120x180)
│     ╱ │카드│ │카드│ │카드│ ╲      │     좌측 -15° / 중앙 0° / 우측 +15°
│    ╱  │ 1 │ │ 2 │ │ 3 │  ╲       │     translateX(-64, 0, +64), 약간 겹침
│       └──┘  └──┘  └──┘             │     컨테이너 height = 240px (회전 여유)
│                                  │
│  (bottom: 탭바 + safe-area)      │
└──────────────────────────────────┘
```

- **카드 3장 절대 위치:** 부채꼴 컨테이너 안에서 `position: absolute` + `transform: translateX(<-64|0|64>) rotate(<-15|0|15>deg)`.
- **호버/탭 lift:** 각 카드는 `:active` 또는 `:hover`(터치 환경 fallback) 시 `translateY(-8px)` 추가 (overlay 표시는 transform-origin 으로). 4050 사용자 발견성 보조.
- **선택 인터랙션 (D-01):** 탭한 즉시 그 자리에서 뒤집기 시작 (selected 카드만 `rotateY` 애니메이션 trigger, 나머지 2장은 opacity 0.3으로 fade out 후 unmount). confirm 단계 없음.
- **idle wobble 미적용:** 프로토타입의 무한 wobble은 framer-motion 의존이라 본 페이즈는 정적 부채꼴.

### result 단계

```
┌──────────────────────────────────┐
│  (top: 32px)                     │
│        ┌─────────┐                │
│        │ 카드 앞면│ ← TarotCardArt size "lg" framed (200x300)
│        │ image   │   중앙 정렬, 카드 위 lift shadow
│        │ (.webp) │                │
│        └─────────┘                │
│         (24px gap)               │
│   ✨ 별 (The Star)              │  ← Display 24px / 700
│                                  │     이모지 + 한국어명 = gray-700
│                                  │     영문명(괄호) = primary, 동일 24px
│         (16px gap)               │
│  [#희망] [#치유] [#영감]         │  ← chip: Label 14px / 700, primary text on primary-light bg
│                                  │     gap 8px, 가운데 정렬, 1줄 wrap 허용
│         (24px gap)               │
│   ┌─────────────────────────┐    │
│   │                         │    │
│   │  카드 메시지 본문        │    │  ← 메시지 카드: 배경 primary-light
│   │  ~300자, 16px / 1.6     │    │     padding 20px, radius 16px
│   │  "~다냥" 마스코트 톤    │    │     가운데 정렬, 본문 텍스트 gray-700
│   │                         │    │
│   └─────────────────────────┘    │
│                                  │
│  ─── (spacer 96px) ───           │  ← 다시 뽑기 fixed 버튼이 가리지 않도록 buffer
│                                  │
└──────────────────────────────────┘
   ┌──────────────────────────┐
   │     다시 뽑기            │   ← position: fixed, 탭바 위
   └──────────────────────────┘
   [────── TabBar ──────]
```

**Vertical rhythm 정리:**
- 카드 이미지 ↔ 이름 헤더: 24px (lg)
- 헤더 ↔ 키워드 chip 그룹: 16px (md)
- 키워드 chip ↔ 메시지 카드: 24px (lg)
- 메시지 카드 ↔ 다시 뽑기 버튼 fixed 영역: 96px spacer (3xl 1.5x)

**카드 컴포넌트 dimensions (`TarotCardArt.jsx` 포팅):**
| size | width | height | aspect ratio | border-radius (outer) | usage |
|------|-------|--------|--------------|-----------------------|-------|
| sm | 64px | 96px | 2:3 | 10px | (현 페이즈 미사용 — 옵션) |
| md | 120px | 180px | 2:3 | 14px | shuffle 부채꼴 3장 |
| lg | 200px | 300px | 2:3 | 18px | intro 뒷면 preview, result 카드 |

**카드 외부 shadow:** `box-shadow: 0 8px 24px rgba(100, 17, 159, 0.12)` (브랜드 보라 톤의 부드러운 lift — `--color-primary` 알파 12%). intro 카드와 result 카드 동일 적용.

**framed 매트(`framed: true` 옵션):** lg size에 한해 카드 둘레 10px 파스텔 매트. 매트 배경 = `linear-gradient(160deg, #FFF8E6, #F4E6FF)` (cream → primary-light). 프로토타입의 oklch 그라디언트를 fortune-cat 토큰으로 단순화.

**카드 뒷면 디자인 (Phase 3 결정 — Claude's Discretion 종결):**
- **방향:** 프로토타입의 라벤더+골드+달 모티브를 fortune-cat 톤(보라+크림)으로 단순화. 마스코트 일러스트는 도입하지 않음 (별도 디자인 검토 필요).
- **구성:** `--color-primary` 그라디언트 배경 + 외곽 골드 hairline border + 중앙 `🌙` 이모지 (size에 따라 36-72px) + 코너 `✦` 4개 (gold tone `#D4A537`).
- **fortune-cat 호환:** oklch 그라디언트 대신 `linear-gradient(135deg, #64119F, #4A0A78)` (primary → primary-dark) + 골드 액센트는 hex `#D4A537` 단독 (TDS 토큰 외부지만 카드 내부 캡슐화 허용).

**다시 뽑기 버튼 (fixed):**
- Position: `fixed; bottom: calc(72px + env(safe-area-inset-bottom) + 8px); left: 16px; right: 16px;`
- Size: 폭 = 100% - 32px (좌우 16px gap), 높이 56px (4050 hit area), `border-radius: 12px`
- Style: `background: var(--color-primary); color: var(--color-white); font-size: 16px; font-weight: 700` (Body Strong)
- Tap feedback: 기존 `.tap-card` 또는 `transform: scale(0.97)` (CSS `:active`)
- Z-index: 15 (탭바 z-index 20 아래, 카드 zoomed overlay 아래)
- Hairline 분리: 버튼 직접 위에 1px border 또는 wrapper에 `box-shadow: 0 -2px 8px rgba(0,0,0,0.04)` 옅게 적용 — 탭바와 시각 분리

---

## Animation

CONTEXT D-02 기반 — CSS만 사용, framer-motion 없음.

| Animation | Duration | Easing | Implementation |
|-----------|----------|--------|----------------|
| 카드 뒤집기 (shuffle → result transition) | 0.5s | `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out 강조) | `transform: rotateY(180deg)` + `transform-style: preserve-3d` + 앞/뒷면 두 layer + `backface-visibility: hidden`. perspective: `parent { perspective: 1200px }`. transform-origin: 50% 50%. |
| 부채꼴 펼침 (intro → shuffle 진입 시) | 0.4s | `ease-out` | 3장 카드 각각 `opacity 0 → 1` + `translateY(-12px → 0)` + 정해진 `rotate` 각도. stagger 0.08s (1번 → 2번 → 3번). |
| 선택 카드 강조 (탭 후 0.1s 안에) | 0.2s | `ease-out` | 선택 카드 `transform: scale(1.15) translateY(20px)` + 다른 2장 `opacity: 0.3`. 0.2s 후 뒤집기 시작. |
| 결과 텍스트 fade-in (카드 뒤집기 완료 후) | 0.4s | `ease-out` | 카드 이름·chip·메시지 각 `opacity 0 → 1` + `translateY(8px → 0)`. stagger 0.15s (이름 → chip → 메시지). 이미 `index.css`에 `@keyframes fadeIn` 존재 — 재사용. |
| intro CTA 버튼 활성 피드백 | 0.15s | `ease` | `.tap-card` 또는 `.tap-pill` 기존 class 재사용 (`transform: scale(0.97 ~ 0.95)`). |

**금지:**
- `transition: all` 사용 금지 — 명시적 property만 (`transform, opacity`).
- 무한 반복(`infinite`) 애니메이션 미사용 (idle wobble 등) — 4050 사용자 시각 부담 + framer-motion 의존성 회피.
- 페이지 전환 트랜지션 (intro → shuffle 슬라이드 등) 미적용 — `currentPage` state 변경 시 즉시 mount/unmount.

---

## Loading & Error States (D-09, D-10)

### intro 단계 fetch 진행 중

`HomePage.jsx` 라인 307-322 패턴 재사용:

```
┌──────────────────────────────────┐
│                                  │
│         (vertical center)        │
│                                  │
│           ⊙ Loader               │  ← TDS Mobile <Loader />
│         (16px gap)               │
│   카드를 준비하고 있어요         │  ← Label 14px / 700, gray-500
│                                  │
└──────────────────────────────────┘
```

- 컨테이너: `padding: 60px 20px; gap: 16px; flex column center`.
- TDS Mobile `<Loader />` import — `HomePage.jsx`에서 이미 사용 중.

### intro 단계 fetch 에러

`HomePage.jsx` 라인 323-352 패턴 재사용 + Sentry.captureException:

```
┌──────────────────────────────────┐
│                                  │
│         (vertical center)        │
│                                  │
│   카드 데이터를                   │  ← Heading 20px / 700, gray-700
│   불러오지 못했어요              │     2줄 가운데 정렬
│         (8px gap)                │
│   잠시 후 다시 시도해주세요      │  ← Body 16px / 400, gray-500
│         (24px gap)               │
│   ┌─────────────────────────┐    │
│   │     다시 시도하기        │    │  ← Primary CTA, 폭 auto, padding 14px 24px
│   └─────────────────────────┘    │     배경 --color-primary, 텍스트 Body Strong (16px / 700 / white)
│                                  │
└──────────────────────────────────┘
```

- 에러 토스트도 동시에 `useToast.openToast({ message: '카드 데이터를 불러오지 못했어요' })` (HomePage 패턴 일관).
- 재시도 버튼: 본 페이즈는 weight 700 통일 정책에 따라 `padding: 14px 24px; fontSize: 16px; fontWeight: 700` (Body Strong)로 통일 — 기존 `Result.jsx`/`HomePage.jsx`의 600 semibold 패턴은 본 페이즈에 미적용 (4050 가독성 + weight 통일 위해 700 채택).
- Sentry: `Sentry.captureException(err, { extra: { phase: 'tarot_intro_fetch' } })` (Loading.jsx 패턴 참고).

---

## Copywriting Contract

| Element | Korean Copy | Tone Note |
|---------|-------------|-----------|
| intro 헤드라인 | `오늘의 한 장을 만나보세요` | 평어체. "뽑아보세요" 보다 "만나보세요"가 4050 정서에 부드러움. |
| intro 부제 | `카드를 한 장 뒤집어 오늘의 메시지를 받아보세요` | 동작과 보상을 한 문장으로. |
| intro 1차 CTA | `오늘의 한 장 뽑기` | 명확한 동사+목적어. CONTEXT specifics "오늘의 한 장을 만나보세요" 변형. |
| intro 로딩 캡션 | `카드를 준비하고 있어요` | "메뉴를 불러오는 중..." 패턴 (HomePage)과 톤 일치. |
| intro 에러 헤드라인 | `카드 데이터를 불러오지 못했어요` | CONTEXT D-10 정확 카피. |
| intro 에러 보조 | `잠시 후 다시 시도해주세요` | 책임 분산 톤(서버 탓 명시 회피). |
| intro 에러 CTA | `다시 시도하기` | `Loading.jsx` 라인 370과 동일. |
| shuffle 헤드라인 | `세 장 중 한 장을 골라보세요` | 평어체. 프로토타입의 "톡! 골라보라냥" 마스코트 톤은 메시지 본문에만 한정 (헤드라인은 명료성 우선). |
| shuffle 보조 | `탭하면 그 자리에서 뒤집혀요` | 인터랙션 가이드. |
| result 카드 메타 | `오늘의 한 장` | 결과 카드 위 작은 캡션 (Label 14px / 700 / gray-500). |
| result 카드 헤더 | `{emoji} {name_ko} ({name_en})` | 예: `✨ 별 (The Star)`. emoji는 카드별, name은 supabase. |
| result 키워드 chip | `#{keyword}` | 예: `#희망`, `#치유`. 2-4개. tarot_cards.keywords 그대로. |
| result 메시지 본문 | (cards.ts 그대로 포팅, "~다냥" 톤 유지) | 카드별 ~300자. CONTEXT specifics "메시지 톤 유지" 명시. |
| result 다시 뽑기 CTA | `다시 뽑기` | 짧고 명확. "다시 뽑아볼까요?" 같은 의문형 회피 (4050에게는 명령형이 친숙). |

**Empty state (해당 없음):**
- intro 단계에서 fetch 진행 중 = loading state. fetch 실패 = error state. 카드 데이터가 비어 있는 경우(예: tarot_cards 0행)는 시드 마이그레이션이 보장하므로 별도 빈 상태 카피 미정의 (해당 시 에러 상태 카피 재사용).

**Destructive actions (해당 없음):**
- 본 페이즈에는 파괴적 액션 없음. "다시 뽑기"는 비파괴 (이전 카드는 단순히 사라짐, 영속 저장 없음).

**카피 작성 룰:**
- 4050 여성: 평서체 + 부드러운 종결어미 (`~보세요`, `~받아보세요`). 명령형(`~하세요`)보다 권유형 우선.
- 마스코트 톤(`~다냥`)은 카드 메시지 본문에만 한정. UI 카피(헤더·CTA·에러)는 표준 평어체 — 도구로서의 명료성 우선.
- "오늘의 카드" / "오늘의 한 장" 표기는 후자로 통일 (PROJECT 데일리 원카드 컨셉 일관).

---

## Tap Targets & Accessibility

CONTEXT specifics "4050 사용자 hit area·대비 기준" + 본 페이즈 추가 요건:

| Element | Tap target size | Notes |
|---------|-----------------|-------|
| intro CTA 버튼 | 폭 ≥240px × 높이 56px | 4050 hit area 충분. WCAG AA 2.5.5 (44×44px) 초과 ✓ |
| shuffle 카드 3장 | 각 120×180px | 카드 자체가 tap target. WCAG AA 초과 ✓ |
| result 카드 (탭 시 zoomed 표시 — Phase 5 책임) | 200×300px | 본 페이즈는 zoomed 인터랙션 미구현 (Phase 5 deferred). 단순 표시. |
| 다시 뽑기 버튼 | 폭 100%-32px × 높이 56px | 4050 hit area 충분 ✓ |
| 에러 재시도 버튼 | 패딩 14×24px (실측 ≥48px) | WCAG AA 만족 ✓ |

**Aria/semantic:**
- 카드 3장: `<button aria-label="카드 1번 선택">` (1, 2, 3). 카드 자체는 `<button>` 또는 `<div role="button" tabIndex={0}>`.
- 카드 이미지: `<img alt="{name_ko}">` (앞면). 뒷면은 `aria-hidden="true"` (장식 요소).
- 키워드 chip: `<span>` (정보 표시만, 비대화형).
- 다시 뽑기 버튼: `<button type="button">다시 뽑기</button>` 단순.
- 로딩 상태: 컨테이너에 `role="status" aria-live="polite"`.
- 에러 상태: 컨테이너에 `role="alert"`.

**Focus visible:**
- 모든 `<button>`은 `:focus-visible` 시 outline 표시. 인라인 스타일 충돌 방지 위해 컨테이너 CSS에서 `button:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` 추가. (현재 fortune-cat 코드베이스 미정의 — 본 페이즈에서 명시 권장)

**Touch behavior:**
- 카드 탭: `touch-action: manipulation` + `-webkit-tap-highlight-color: transparent` (기존 `.tap-card` 패턴 일치).

---

## Component Inventory (신규/포팅)

| Component | 위치 | 책임 | 비고 |
|-----------|------|------|------|
| `TarotPage.jsx` (확장) | `src/pages/` | `currentPage` 상태 머신 + 22장 fetch + handlers | Phase 2 빈 컨테이너에서 확장. useState 4종(`currentPage`, `cardsData`, `selectedCardId`, `errorState`). |
| `TarotIntro.jsx` (신규, 옵션) | `src/components/` | intro 단계 UI (헤드라인+카드 preview+CTA+로딩/에러) | TarotPage에서 inline 가능, 200줄 초과 시 분리 권장. |
| `TarotShuffle.jsx` (신규, 옵션) | `src/components/` | shuffle 단계 UI (부채꼴 3장+안내+선택 핸들러) | 동일 — TarotPage에서 inline 가능. |
| `TarotResult.jsx` (신규) | `src/components/` | result 단계 UI (카드+이름+키워드+메시지+다시뽑기) | 별도 컴포넌트 권장 (탭바 위 fixed 버튼·spacer 캡슐화). |
| `TarotCardArt.jsx` (신규, 포팅) | `src/components/` | 카드 시각화 — 앞/뒷면 + framed 매트 + 이미지 prop | 프로토타입 `TarotCardArt.tsx` TS→JS 포팅. Tailwind→inline style. oklch→hex (위 Color 참조). framer-motion 제거. |
| `getCardImageUrl(id)` | `src/assets/images/cards/index.js` (신규) | id 0~21 → 정적 import 모듈 매핑 | 22장 `import card00 from './00.webp'` 형태 + 배열 반환. |
| `fetchTarotCards()` | `src/lib/supabase.js` (확장) | `tarot_cards` 22행 select | 메뉴 테이블 조회 패턴 재사용. |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | (none — shadcn 미초기화) | not applicable |
| 3rd-party | (none) | not applicable |

**근거:** Phase 1 D-08 신규 의존성 금지 + Phase 3 D-02 carry-forward. UI는 100% 자체 구현 또는 TDS Mobile 컴포넌트(`Loader`).

---

## Cross-Phase Consistency

### Phase 2 (TabBar)와의 시각 일관성
- 다시 뽑기 fixed 버튼은 탭바(높이 ~72px + safe-area)를 가리지 않도록 `bottom: calc(72px + env(safe-area-inset-bottom) + 8px)` 명시. 탭바 hairline border와 충돌 회피.
- 본 페이즈 새 페이지 (`/tarot`) 안에서만 탭바가 표시됨 (Phase 2 D-05 carry-forward). intro/shuffle/result 모든 단계에서 탭바 노출.

### v1.0 사주 흐름과의 시각 일관성
- 색상 토큰: `--color-primary` (#64119F 보라) + `--color-gray-*` 그대로 — HomePage·SajuPage·AmuletPage·Result.jsx와 100% 일치.
- 결과 메시지 카드 패턴: `--color-primary-light` 배경 + `borderRadius: 16px` + `padding: 20px` — `Result.jsx` 라인 203 패턴 동일.
- 에러 처리 UX: `Loading.jsx` 라인 322-389 (이모지 + 헤드라인 + 재시도 버튼) 또는 `HomePage.jsx` 라인 323-352 (캡션 + 재시도 버튼) 중 후자 채택 (intro 단계는 카드 일러스트 자리 활용 가능 vs HomePage는 단순). **본 페이즈는 HomePage 패턴 채택** — intro 단계 자체가 시각적으로 가벼우므로.
- **Weight 정책 차이:** v1.0 페이지(`Result.jsx`·`HomePage.jsx`)는 보조 라벨에 600 semibold를 혼용하지만, 본 페이즈는 weight 통일 정책에 따라 400 / 700만 사용. 신규 컴포넌트 작성 시에만 적용되며, v1.0 기존 코드는 수정하지 않음.

### Phase 4 광고 게이팅 준비
- 다시 뽑기 버튼의 `onClick` 핸들러는 본 페이즈에서 `setCurrentPage('shuffle')` + `setSelectedCardId(null)` + `setCardsData(reshuffle...)` 직접 호출. Phase 4가 이 핸들러 안쪽에 광고 호출을 wrap.
- 광고 시청 화면 진입 시점에는 `Loading.jsx` 패턴 재사용 예정 — 본 페이즈에서 다시 뽑기 버튼 `bottom` 위치·크기를 변경하면 Phase 4 시각 흐름이 깨지므로 본 contract 잠금.

### Phase 5 공유 + Analytics 준비
- 결과 카드의 zoomed 인터랙션(프로토타입 `result.tsx` 라인 195-232)은 본 페이즈 미구현 (Phase 5 책임).
- 결과 화면 헤더 위 또는 우측에 공유 아이콘 버튼 자리는 본 페이즈에서 비워 둠. Phase 5가 그 자리(예: 카드 이미지 우측 상단 absolute)에 공유 버튼 추가.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS — 11개 UI string 정의 (CTA·empty/loading/error·destructive 미해당)
- [ ] Dimension 2 Visuals: PASS — 단계별 layout + 카드 dimensions + animation timing 명세
- [ ] Dimension 3 Color: PASS — 60/30/10 분배 명시 + accent reserved-for 5개 elements + WCAG AA contrast 검증
- [ ] Dimension 4 Typography: PASS — 4 sizes (24/20/16/14) + **2 weights (400/700) 통일** + Body Strong(16/700) CTA 라벨 분리 + Label·chip·meta 모두 700 + line-heights 명세
- [ ] Dimension 5 Spacing: PASS — 8-point scale (4/8/16/24/32/48/64) + exceptions 3건 명시
- [ ] Dimension 6 Registry Safety: PASS — shadcn 미사용, 3rd-party 0건 (D-02 신규 의존성 금지 carry-forward)

**Approval:** pending

---

*Phase: 03-daily-one-card-core*
*UI-SPEC drafted: 2026-05-02*
*UI-SPEC revised: 2026-05-02 (Typography weight 통일 — 600 → 700, Dimension 4 BLOCK 해소)*
*Pre-populated from: REQUIREMENTS.md (TAROT-01/02/03), CONTEXT.md (D-01~D-11), Phase 1 INVENTORY.md (22장 카드 메타), Phase 2 CONTEXT.md (탭바 높이·visibility), HomePage.jsx/Result.jsx/Loading.jsx/TabBar.jsx (시각 일관성)*
