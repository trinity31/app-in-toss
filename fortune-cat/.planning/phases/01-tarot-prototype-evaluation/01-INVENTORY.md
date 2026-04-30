# Phase 1: boknyang-tarot 자산 인벤토리

**Created:** 2026-04-30
**Source prototype:** `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/`
**Decisions referenced:** D-01, D-03, D-04, D-06, D-07, D-10 (see `01-CONTEXT.md`)
**Downstream consumers:** Phase 2 (탭바), Phase 3 (데일리 원카드 코어), Phase 5 (Analytics·공유)

> 본 문서는 외부 프로토타입(`boknyang-tarot`)의 자산을 fortune-cat 측 통합 지점과 1:1로 매핑하기 위한 Phase 1 산출물입니다. 후속 페이즈(2~5)의 플래너·실행자가 grep으로 자산 위치·포팅 여부·대응 fortune-cat 위치를 즉시 찾을 수 있도록 표 형태로 작성했습니다. 평가/문서화 전용으로 소스 코드 변경은 없습니다.

---

## 자산 인벤토리

### 라우트 (Routes)

| 파일 경로 | 역할 | In/Out-of-scope | 대응 fortune-cat 위치 | 관련 D-XX | 비고 |
|-----------|------|-----------------|------------------------|-----------|------|
| `src/routes/__root.tsx` | TanStack Router root + Outlet + BottomNav 렌더 + zustand `hydrate()` 호출 | Out-of-scope (직접 포팅 아님) | `src/App.jsx` 라우터 구조 + Provider 래핑 + Phase 2 탭바 셸 | D-08, D-10 | TanStack Router 전용 API(`createRootRoute`, `useLocation`)는 fortune-cat의 React Router DOM과 다름. 셸 책임은 `App.jsx` Provider 구조 + Phase 2 탭바로 흡수. |
| `src/routes/index.tsx` | 진입(홈) — `todayDraw` 조회 후 "카드 뽑기" / "다시 보기" CTA 분기 | In-scope | `src/pages/TarotPage.jsx` 내부 `currentPage = 'intro'` 단계 | D-10 | TanStack Router `createFileRoute("/")` → fortune-cat은 단일 라우트(`TarotPage`) 안 `currentPage` 상태 머신. PROJECT.md "별도 `/tarot` 라우트 추가 금지" 제약과 부합. |
| `src/routes/shuffle.tsx` | 카드 셔플/선택 — 부채꼴 3장 중 1장 선택 → `recordDraw` → `/result` 이동 | In-scope | `src/pages/TarotPage.jsx` 내부 `currentPage = 'shuffle'` 단계 | D-10 | framer-motion 애니메이션 비중 큼(D-09 미결정). `pickRandomCardId`/`recordDraw`는 zustand → Context 또는 useState로 재구현(D-08). |
| `src/routes/result.tsx` | 결과 — 카드 플립 + 메시지/키워드/별점 + 토스 공유 시트 호출 | In-scope | `src/pages/TarotPage.jsx` 내부 `currentPage = 'result'` 단계 | D-10 | 공유 로직(`getTossShareLink` + `appsShare`)은 Phase 5에서 fortune-cat 패턴(토스 공유 시트)과 통합. `RatingWidget` 부분은 Out-of-scope이므로 제외. |
| `src/routes/archive.tsx` | 최근 7일 카드 히스토리 펼침/접힘 리스트 | Out-of-scope (Reviewed but excluded) | (없음) | D-04 | 사유: 데일리 원카드 1종 한정 정책(D-04). 다음 마일스톤 후보 — 사용자별 카드 히스토리 기능 검토 시 재활용 가능. |

### 컴포넌트 (Components)

| 파일 경로 | 역할 | In/Out-of-scope | 대응 fortune-cat 위치 | 관련 D-XX | 비고 |
|-----------|------|-----------------|------------------------|-----------|------|
| `src/components/TarotCardArt.tsx` | 카드 시각화 핵심 — 앞/뒷면 + framed 매트 + 이미지/이모지 양쪽 모드 지원 | In-scope (핵심) | `src/components/TarotCardArt.jsx` (TS→JS 포팅, D-08) | D-06, D-08 | `image` prop을 사용하면 정적 임포트 카드 이미지 렌더(D-06). framer-motion `motion.img` 페이드인은 D-09 결정 후 처리. oklch 색상은 Emotion `css` prop으로 이전. |
| `src/components/BottomNav.tsx` | 하단 탭바 (홈/기록 2탭) — TanStack Router `Link` + `useLocation` | In-scope (참고용) | Phase 2 탭바 셸에서 TDS Mobile로 재구현 — 직접 포팅 아님 | D-08 | 디자인 패턴(아이콘+레이블, active 강조)과 active 판정 로직(`/`, `/shuffle`, `/result` 묶음)만 참고. lucide-react 아이콘은 TDS 아이콘 또는 카드/이모지로 대체. |
| `src/components/Boknyang.tsx` | 마네키네코 마스코트 SVG (홈 화면 중앙) | Out-of-scope (Reviewed but excluded) | (없음) | D-04 | 사유: 캐릭터 IP 활용 검토 필요(D-04). 별도 디자인/브랜드 검토 단계가 필요해 v1.1에서는 도입 보류. |
| `src/components/RatingWidget.tsx` | 별점 1~5점 1탭 평가 + LS 영속 + 이벤트 송출 | Out-of-scope (Reviewed but excluded) | (없음) | D-04 | 사유: v1.2 이후 PMF 측정 도구 후보(D-04). `lib/ratings.ts` 의존이라 함께 제외. |
| `src/components/Particles.tsx` | 화면 위로 떠오르는 하트·별 파티클(framer-motion) | Out-of-scope (Reviewed but excluded) | (없음) | D-04, D-09 | 사유: framer-motion 도입과 함께 검토(D-04·D-09). Phase 2/3에서 TDS 기본 트랜지션 검토 후 재평가. |

### 데이터 (Data)

| 파일 경로 | 역할 | In/Out-of-scope | 대응 fortune-cat 위치 | 관련 D-XX | 비고 |
|-----------|------|-----------------|------------------------|-----------|------|
| `src/data/cards.ts` | 메이저 아르카나 22장 — `{ id, nameKo, nameEn, emoji, image, keywords, message }` + `getCardById` | In-scope | **Supabase `tarot_cards` 테이블** (D-07) — 클라이언트 정적 데이터로 두지 않음 | D-07 | 정확한 스키마는 Phase 3 마이그레이션에서 확정(권장 컬럼: `id`, `name_ko`, `name_en`, `emoji`, `image_path`, `keywords` text[], `message`). 메시지 톤(`~다냥`)·길이(카드별 ~300자) 그대로 유지 — 4050 여성 사용자 마스코트 톤(CONTEXT specifics). `image: img(id)` 경로 규칙은 fortune-cat에서 정적 임포트로 대체. |

### 라이브러리/스토어 (Libraries & Store)

| 파일 경로 | 역할 | In/Out-of-scope | 대응 fortune-cat 위치 | 관련 D-XX | 비고 |
|-----------|------|-----------------|------------------------|-----------|------|
| `src/store/tarot.ts` | zustand 스토어 — `history` LS 영속 + `hydrate`/`todayDraw`/`recordDraw`/`pickRandomCardId` | In-scope | `src/contexts/TarotContext.jsx` 또는 `TarotPage` 내부 `useState` (Phase 3 결정) | D-08 | **zustand → React Context API + `useState`** 재구현 대상. `STORAGE_KEY = "boknyang.history.v1"`은 `fortunecat.tarot.history.v1` 등 fortune-cat 네임스페이스로 변경 후, Toss `Storage` 또는 localStorage 사용(현재 `useUserInfoStorage` 패턴 참조). 신규 의존성 추가 없음(D-08). |
| `src/lib/utils.ts` | `cn(...inputs)` Tailwind 클래스 머지 헬퍼(`clsx` + `tailwind-merge`) | In-scope (필요 부분만) | (없음 — Emotion `css` prop으로 대체) | D-08 | Tailwind를 사용하지 않으므로 `cn` 자체는 포팅 대상 아님. 현재 import된 곳이 데일리 원카드 흐름에 있는지 Phase 3에서 grep 후 확정 — 호출되는 부분만 Emotion 변환 시 자연 소거. |
| `src/lib/ratings.ts` | 별점 LS 영속 모듈(`loadRatings`/`saveRating`/`getRatingForDate`) | Out-of-scope (Reviewed but excluded) | (없음) | D-04 | 사유: `RatingWidget` 의존(out). v1.2 PMF 도구 검토 시 재활용 가능. |
| `src/lib/session.ts` | 디바이스 단위 UUID v4 세션 ID 생성/조회 | Out-of-scope | (없음 — fortune-cat 자체 패턴 사용) | D-08 | 사유: fortune-cat은 `getAnonymousKey()`(Toss 익명키)와 `useSession` 훅을 이미 사용. 자체 세션 ID 생성기는 중복이라 미포팅. |
| `src/lib/track.ts` | 토스 `eventLog`로 이벤트 송출 + `session_id` 자동 주입 | Out-of-scope | (없음 — fortune-cat 자체 패턴 사용) | D-04, D-08 | 사유: fortune-cat은 Firebase `logEvent`(`src/lib/firebase.js`) 패턴 사용. Phase 5에서 4종 타로 이벤트(진입/뽑기/광고/공유)를 `logEvent`로 기록. 토스 `eventLog`는 도입하지 않음. |

### 카드 이미지 (Card Images)

> **중요:** CONTEXT.md D-06은 `.png`로 가정했으나 실제 프로토타입은 **`.webp`** 형식이다(`public/cards/00.webp ~ 21.webp`). Phase 3 자산 복사 시점에 PNG 변환 여부 또는 WebP 그대로 유지 여부를 별도 결정한다 (CONTEXT deferred "카드 이미지 파일 포맷(PNG vs WebP)·압축 수준" 참조). 현재 fortune-cat의 `src/assets/images/`에는 PNG만 존재하므로 형식 일관성 vs 파일 크기 트레이드오프 고려 필요.

| 파일명 | 메이저 아르카나 ID | 실제 형식 | 대응 fortune-cat 위치 | 비고 |
|--------|--------------------|-----------|------------------------|------|
| `00.webp` | 0 — The Fool (바보) | WebP | `src/assets/images/cards/00.webp` (정적 임포트, D-06) | 키워드: 시작/자유/설렘 |
| `01.webp` | 1 — The Magician (마법사) | WebP | `src/assets/images/cards/01.webp` (정적 임포트, D-06) | 키워드: 창조/의지/재능 |
| `02.webp` | 2 — The High Priestess (여사제) | WebP | `src/assets/images/cards/02.webp` (정적 임포트, D-06) | 키워드: 직관/비밀/고요 |
| `03.webp` | 3 — The Empress (여황제) | WebP | `src/assets/images/cards/03.webp` (정적 임포트, D-06) | 키워드: 풍요/사랑/포근 |
| `04.webp` | 4 — The Emperor (황제) | WebP | `src/assets/images/cards/04.webp` (정적 임포트, D-06) | 키워드: 안정/리더십/체계 |
| `05.webp` | 5 — The Hierophant (교황) | WebP | `src/assets/images/cards/05.webp` (정적 임포트, D-06) | 키워드: 배움/전통/조언 |
| `06.webp` | 6 — The Lovers (연인) | WebP | `src/assets/images/cards/06.webp` (정적 임포트, D-06) | 키워드: 인연/선택/조화 |
| `07.webp` | 7 — The Chariot (전차) | WebP | `src/assets/images/cards/07.webp` (정적 임포트, D-06) | 키워드: 전진/승리/용기 |
| `08.webp` | 8 — Strength (힘) | WebP | `src/assets/images/cards/08.webp` (정적 임포트, D-06) | 키워드: 용기/인내/다정 |
| `09.webp` | 9 — The Hermit (은둔자) | WebP | `src/assets/images/cards/09.webp` (정적 임포트, D-06) | 키워드: 성찰/지혜/쉼 |
| `10.webp` | 10 — Wheel of Fortune (운명의 수레바퀴) | WebP | `src/assets/images/cards/10.webp` (정적 임포트, D-06) | 키워드: 변화/기회/흐름 |
| `11.webp` | 11 — Justice (정의) | WebP | `src/assets/images/cards/11.webp` (정적 임포트, D-06) | 키워드: 균형/공정/선택 |
| `12.webp` | 12 — The Hanged Man (매달린 사람) | WebP | `src/assets/images/cards/12.webp` (정적 임포트, D-06) | 키워드: 전환/관점/기다림 |
| `13.webp` | 13 — Death (죽음) | WebP | `src/assets/images/cards/13.webp` (정적 임포트, D-06) | 키워드: 변화/마무리/재생 |
| `14.webp` | 14 — Temperance (절제) | WebP | `src/assets/images/cards/14.webp` (정적 임포트, D-06) | 키워드: 조화/절제/치유 |
| `15.webp` | 15 — The Devil (악마) | WebP | `src/assets/images/cards/15.webp` (정적 임포트, D-06) | 키워드: 유혹/집착/해방 |
| `16.webp` | 16 — The Tower (탑) | WebP | `src/assets/images/cards/16.webp` (정적 임포트, D-06) | 키워드: 변동/진실/각성 |
| `17.webp` | 17 — The Star (별) | WebP | `src/assets/images/cards/17.webp` (정적 임포트, D-06) | 키워드: 희망/치유/영감 |
| `18.webp` | 18 — The Moon (달) | WebP | `src/assets/images/cards/18.webp` (정적 임포트, D-06) | 키워드: 감성/꿈/직감 |
| `19.webp` | 19 — The Sun (태양) | WebP | `src/assets/images/cards/19.webp` (정적 임포트, D-06) | 키워드: 행복/성공/활력 |
| `20.webp` | 20 — Judgement (심판) | WebP | `src/assets/images/cards/20.webp` (정적 임포트, D-06) | 키워드: 부활/결단/용서 |
| `21.webp` | 21 — The World (세계) | WebP | `src/assets/images/cards/21.webp` (정적 임포트, D-06) | 키워드: 완성/성취/조화 |

---

## In-scope vs Out-of-scope 요약

### In-scope (포팅 평가 대상)

D-03 In-scope 결정에 따라 다음 자산이 포팅 평가 대상이다.

- **라우트 3개 (D-03):** `index.tsx` (진입/홈), `shuffle.tsx` (셔플/선택), `result.tsx` (결과/공유) — 모두 fortune-cat의 `TarotPage.jsx` 단일 라우트 내부 `currentPage` 상태 머신(`intro` → `shuffle` → `result`)으로 통합(D-10).
- **컴포넌트 2개 (D-03):** `TarotCardArt.tsx` (카드 시각화 핵심, TS→JS 포팅 대상), `BottomNav.tsx` (Phase 2 탭바 참고용 — 직접 포팅 아님, TDS Mobile로 재구현).
- **데이터 1개 (D-03):** `src/data/cards.ts` — 22장 메이저 아르카나. 텍스트는 Supabase `tarot_cards` 테이블로 이전(D-07), 이미지는 `src/assets/images/cards/`에 정적 임포트(D-06).
- **라이브러리 부분 (D-03):** `store/tarot.ts` — zustand → React Context + `useState` 재구현(D-08). `lib/utils.ts`는 데일리 원카드 흐름에서 호출되는 부분만 Phase 3에서 grep 후 확정.

### Reviewed but excluded

D-04에 의해 인벤토리에 기록만 남긴다 — 다음 마일스톤 후보 자료로 활용 가능하도록.

- **`archive.tsx` (라우트):** 데일리 원카드 1종 한정 정책으로 v1.1 제외(D-04). 차후 사용자별 카드 히스토리 기능 검토 시 재활용 가능.
- **`Boknyang.tsx` (컴포넌트):** 캐릭터 IP 활용. 별도 디자인/브랜드 검토 단계 필요(D-04).
- **`RatingWidget.tsx` (컴포넌트):** 카드 결과 만족도 평가. v1.2 이후 PMF 측정 도구로 검토 가능(D-04).
- **`Particles.tsx` (컴포넌트):** 카드 뽑기 인터랙션 강화. framer-motion 도입(D-09)과 함께 Phase 2/3에서 우선 평가(D-04).
- **`lib/ratings.ts` (라이브러리):** `RatingWidget` 의존. v1.2 PMF 도구 검토 시 재활용 가능.
- **`lib/session.ts` (라이브러리):** fortune-cat은 `getAnonymousKey()`와 `useSession` 훅을 이미 사용 — 자체 세션 ID 생성기는 중복.
- **`lib/track.ts` (라이브러리):** fortune-cat은 Firebase `logEvent` 패턴을 사용 — 토스 `eventLog`는 도입하지 않음(Phase 5에서 4종 타로 이벤트를 `logEvent`로 기록).

---

## 대응 fortune-cat 통합 지점 요약

후속 페이즈(2~5) 플래너가 신규 코드를 어디에 두어야 하는지 한눈에 파악할 수 있도록 정리한다.

- **`src/assets/images/cards/`** (신설) — 카드 이미지 22장 정적 임포트 위치(D-06). 형식은 `.webp` (실제) 또는 `.png`(D-06 가정) 중 Phase 3에서 결정.
- **Supabase `tarot_cards` 테이블** (신설, Phase 3) — 카드 해석 텍스트(이름/영문 이름/이모지/키워드/메시지)(D-07). 메뉴 테이블 패턴(`ai_saju_types`, `amulet_types`)과 일관.
- **`src/pages/TarotPage.jsx`** (신설, Phase 3) — 단일 라우트 + `currentPage` 상태 머신(`intro` → `shuffle` → `result`)(D-10). 기존 `SajuPage.jsx`/`AmuletPage.jsx` 패턴 그대로 차용.
- **`src/components/TarotCardArt.jsx`** (신설, Phase 3) — `TarotCardArt.tsx`의 TS→JS 포팅(D-08). Tailwind 클래스 → Emotion `css` prop, oklch 색상 → TDS 토큰 또는 Emotion inline 정의.
- **`src/App.jsx` + 신규 탭바 컴포넌트** (Phase 2) — `BottomNav.tsx` 참고하되 TDS Mobile로 재구현. 기존 라우트 4개(`/`, `/saju`, `/new-year`, `/amulet`)와 공존.
- **`src/lib/supabase.js`** (확장, Phase 3) — `tarot_cards` 조회 함수 추가(`getMenuImageUrl` 등 메뉴 테이블 조회 패턴 재사용).
- **`src/contexts/TarotContext.jsx` 또는 `TarotPage` 내부 `useState`** (신설, Phase 3) — zustand `useTarotStore` 대체(D-08). 정확한 위치(전역 Context vs 로컬 state)는 Phase 3에서 결정.

---

*Phase: 01-tarot-prototype-evaluation*
*Plan: 01 (Asset inventory + Gap matrix)*
*Inventory written: 2026-04-30*
