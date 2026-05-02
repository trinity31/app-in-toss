# Phase 3: 데일리 원카드 코어 화면 - Context

**Gathered:** 2026-05-02
**Status:** Ready for planning

<domain>
## Phase Boundary

타로 탭(`/tarot`) 안에서 사용자가 **카드 뒷면 확인 → 부채꼴 3장 중 1장 선택 → 뒤집기 애니메이션 → 카드 이미지·이름·해석 결과 화면**으로 이어지는 데일리 원카드 흐름을 구현한다. Phase 2가 만든 `TarotPage.jsx` 빈 컨테이너에 `currentPage` 상태 머신(`intro` → `shuffle` → `result`)을 채워 넣는다.

**Phase 3 책임:** `tarot_cards` Supabase 마이그레이션 + 22장 카드 이미지 정적 임포트 + 인터랙션 + 결과 화면 UI + 다시 뽑기 액션(무제한 동작).

**Phase 3 책임 외 (다음 페이즈):**
- 광고 시청 게이팅(다시 뽑기 시 광고) → Phase 4
- Firebase Analytics 이벤트 + 토스 공유 시트 → Phase 5

**SC3 명시:** Phase 3는 "다시 뽑기" 액션이 **무제한**으로 동작한다 (광고 게이팅 없음). Phase 4가 그 위에 광고 호출을 삽입한다.

</domain>

<decisions>
## Implementation Decisions

### 셔플/뒤집기 인터랙션

- **D-01:** **셔플 단계 = 부채꼴 3장 중 1장 선택** 패턴을 프로토타입에서 포팅한다.
  - boknyang-tarot `src/routes/shuffle.tsx` + `pickRandomCardId` 로직 참고.
  - 시각적 풍성함을 위해 부채꼴 형태(중앙 카드 0°, 좌측 -15°, 우측 +15° 회전 + 살짝 겹침)로 펼친다.
  - `currentPage = 'intro'` → '오늘의 카드 뽑기' 탭 → `currentPage = 'shuffle'` 전환 시점에 부채꼴 렌더.
  - 사용자가 3장 중 1장을 탭하면 그 자리에서 뒤집기 애니메이션 후 `currentPage = 'result'`로 전환.

- **D-02:** **카드 뒤집기 애니메이션은 CSS keyframes/`transform: rotateY(180deg)`로 구현**한다.
  - 회전 시간 ~0.4s, `transform-style: preserve-3d` + 앞/뒷면 두 layer (`backface-visibility: hidden`).
  - **`framer-motion` 도입하지 않는다** — Phase 1 D-09 보류 상태를 본 페이즈 결정으로 종결: 신규 의존성 추가 없음(Phase 1 P1-D-08 carry-forward).
  - 부채꼴 펼침/모이기 애니메이션도 CSS `transform` + `transition`으로 처리. spring 타이밍 같은 정밀 모션은 포기하고 단순 ease-out로 대체.
  - 4050 사용자 멘탈 모델: 단순한 한 번의 회전이면 충분.

- **D-03:** **22장 중 매 세션마다 랜덤 3장 추출**, 모두 **동일한 뒷면**으로 표시한다.
  - 사용자가 1장 탭하기 전까지 어느 카드가 어느 자리에 있는지 알 수 없음 (프로토타입과 동일).
  - 랜덤 추출은 클라이언트 측 (Math.random 또는 crypto.getRandomValues — 정확한 구현은 Claude's Discretion).
  - 같은 카드가 3장에 중복 나오지 않도록 셔플 후 상위 3장 선택.

- **D-04:** **'다시 뽑기' 액션은 `currentPage = 'shuffle'`로 돌아가 새 3장 부채꼴을 제시**한다.
  - intro 단계는 건너뛰고 바로 shuffle. 재진입 시 22장에서 새로 랜덤 3장 추출.
  - Phase 4 광고 게이팅이 들어갈 위치: '다시 뽑기' 클릭 핸들러 안. Phase 3는 광고 없이 즉시 shuffle로 이동.

### 결과 화면 레이아웃 (TAROT-02)

- **D-05:** **결과 화면 구조 = 상단 중앙 큰 카드 이미지 + 아래 텍스트 수직 흐름.**
  - 카드 이미지: 화면 너비의 50-60%, 상단 여백 후 중앙 배치.
  - 카드 아래에 텍스트 블록 수직 나열.
  - 4050 사용자 mental: 좌우 분할보다 수직 흐름이 익숙.

- **D-06:** **텍스트 구성 = 한국어명·영문명·이모지(헤더) → keyword chip 2-4개 → 메시지 소단락(~300자).**
  - 헤더 한 줄: `이모지 한국어명 (영문명)` 형식 (예: `✨ 별 (The Star)`).
  - keyword: chip 형태(rounded pill, TDS 토큰 또는 inline style), 가로 나열.
  - 메시지: 카드별 ~300자, 본문 폰트 16-17px 권장(4050 가독성), 줄간격 1.5-1.6.
  - 메시지 톤: 프로토타입 cards.ts의 "~다냥" 마스코트 톤 그대로 유지 (Phase 1 specifics).

- **D-07:** **'다시 뽑기' 버튼 = 화면 하단 fixed 위치, 탭바 바로 위.**
  - `position: fixed; bottom: <탭바높이 + safe-area-inset-bottom + 8px>`.
  - 결과 콘텐츠 하단에 같은 높이의 spacer를 둬서 메시지가 버튼 뒤에 가리지 않도록.
  - 4050 사용자에게 항상 익숙한 자리에 있어 발견성 보장.

### tarot_cards Supabase 스키마 + fetch 전략

- **D-08:** **`tarot_cards` 테이블 스키마:**
  | 컬럼 | 타입 | 비고 |
  |------|------|------|
  | id | int PK | 0~21 (메이저 아르카나 ID) |
  | name_ko | text | 한국어명 (예: "바보", "마법사") |
  | name_en | text | 영문명 (예: "The Fool", "The Magician") |
  | emoji | text | 이모지 1-2자 |
  | image_path | text | `'00.webp'` ~ `'21.webp'` (D-11 형식) |
  | keywords | text[] | 2-4개 (예: `{시작, 자유, 설렘}`) |
  | message | text | 카드별 ~300자 본문 |
  - `created_at`/`updated_at`/`sort_order`/`is_active` 같은 운영 메타데이터는 본 페이즈에서 추가하지 않는다. 시즌 콘텐츠 교체 시점에 별도 마이그레이션으로 확장 가능 (deferred).
  - migration SQL 위치: `scripts/<날짜>_create_tarot_cards.sql` (fortune-cat의 기존 scripts/*.sql 패턴과 일관).
  - 22장 seed 데이터: 동일 마이그레이션 안에 INSERT 구문 포함. 메시지 본문은 프로토타입 `cards.ts`에서 추출(메시지 톤 유지, Phase 1 specifics).

- **D-09:** **카드 데이터 fetch 시점 = intro 단계 진입 시 22장 전체 prefetch.**
  - `useEffect` 안에서 `supabase.from('tarot_cards').select('*')` 1회 호출.
  - 응답을 TarotPage 내부 state(또는 D-12 위임)에 저장 → shuffle/result 전이가 즉시(0 latency).
  - 22장 소량 데이터(이미지 제외 텍스트만 ~10KB)이므로 메모리 부담 없음.

- **D-10:** **fetch 에러 처리 = intro 로딩 스피너 + 재시도 버튼.**
  - fetch 진행 중: intro 페이지에 로딩 스피너 (전체 화면 차단 아닌 일반 spinner, fortune-cat HomePage 패턴 일관).
  - fetch 실패: 에러 메시지 ("카드 데이터를 불러오지 못했어요") + "다시 시도" 버튼 + Sentry.captureException(상황 기록).
  - HomePage `Promise.all` + `setHasError` + `useToast` 패턴(`.planning/codebase/ARCHITECTURE.md`)을 차용.
  - 재시도 버튼은 useEffect dependency 또는 fetch 함수 재호출.

### 카드 이미지 형식

- **D-11:** **카드 이미지 22장은 `.webp` 형식 그대로 유지**한다.
  - 프로토타입의 `public/cards/00.webp ~ 21.webp` 22장을 fortune-cat의 `src/assets/images/cards/` 디렉토리에 복사.
  - Vite 정적 임포트 (`import card00 from '...00.webp'` 패턴) 사용.
  - 이미지 전용 인덱스 모듈(예: `src/assets/images/cards/index.js`)을 만들어 `getCardImageUrl(id)` 함수 export 권장 — 정확한 위치는 Claude's Discretion.
  - Phase 1 D-06 가정(`.png`)에서 실제 형식(`.webp`)으로 정정 — Phase 1 GAPS.md "카드 이미지 형식" 행 종결.
  - 파일 크기 ~50% 이점, AIT 빌드(Vite) WebP 정적 임포트 지원 확인됨.

### Claude's Discretion

- **state 관리 위치 (TarotPage useState vs TarotContext):** Phase 3 범위 안에서는 useState 충분(currentPage·cardsData·selectedCardId·errorState). Phase 4(광고)·Phase 5(Analytics·공유)에서 공유 필요성이 드러나면 그 시점에 Context로 끌어올림. 본 페이즈는 useState로 시작.
- **22장 중 랜덤 3장 추출 알고리즘** (Math.random vs crypto.getRandomValues, Fisher-Yates shuffle 등 — 동작상 동일, 코드 단순성 우선).
- **부채꼴 각도/간격 정확값** (예: -15° / 0° / +15°, 카드 간 겹침 정도) — 프로토타입 시각 참고하되 fortune-cat 디자인과 조정.
- **카드 뒷면 디자인** — 프로토타입의 뒷면 패턴(라벤더+별 패턴)을 가져올지, fortune-cat 마스코트 일러스트 스타일로 단순화할지. 시각적 검토 후 결정.
- **`getCardImageUrl(id)` 정확한 함수 시그니처/위치** (단일 헬퍼 vs 컴포넌트 import 매핑).
- **intro 페이지 카피 문구** ("오늘의 한 장을 만나보세요" 등) — 4050 톤에 맞춰 작성.
- **shuffle 단계 부채꼴 펼침 애니메이션 타이밍** (CSS transition duration·easing).
- **결과 화면 키워드 chip의 색상 토큰** (TDS grey vs 브랜드 컬러 — 메시지 본문과 시각 균형 고려).
- **다시 뽑기 버튼의 라벨 텍스트** ("다시 뽑기" vs "다시 뽑아볼까요?" 등 — 4050 톤).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents (researcher, planner) MUST read these before planning or implementing.**

### 프로젝트 컨텍스트

- `.planning/PROJECT.md` — 비전·Core Value·제약·Key Decisions. Phase 2 결정으로 `/tarot` 라우트가 정식 추가됨 (Out of Scope에서 제거됨).
- `.planning/REQUIREMENTS.md` — v1.1 요구사항. 본 페이즈 매핑: TAROT-01 (카드 뒤집기), TAROT-02 (이미지·이름·해석 함께), TAROT-03 (다시 뽑기).
- `.planning/ROADMAP.md` — Phase 3 정의 + 4개 Success Criteria + Phase 4·5 의존 관계.
- `.planning/STATE.md` — 현재 진행 상황·세션 노트.

### Phase 1·2 산출물 (선행 결정 사항)

- `.planning/phases/01-tarot-prototype-evaluation/01-CONTEXT.md` — Phase 1 잠금 결정. 본 페이즈 carry-forward: P1-D-06(이미지 정적 임포트, 단 형식은 D-11에서 webp로 확정), P1-D-07(텍스트 Supabase), P1-D-08(신규 의존성 금지), P1-D-10(단일 라우트 + currentPage). P1-D-09(framer-motion 보류) → 본 페이즈 D-02로 종결.
- `.planning/phases/01-tarot-prototype-evaluation/01-INVENTORY.md` — 프로토타입 자산 표. **본 페이즈 핵심 참조**: 라우트(`shuffle`·`result`), 컴포넌트(`TarotCardArt`), 데이터(`cards.ts`), 라이브러리(`store/tarot.ts`), 카드 이미지 22장.
- `.planning/phases/01-tarot-prototype-evaluation/01-GAPS.md` — 갭 매트릭스. **본 페이즈 직접 영향**: 스타일링(🟡 Tailwind→Emotion), 상태관리(🟡 zustand→useState), 언어(🟡 TS→JSX), 카드 데이터 위치(🟡 정적→Supabase), 카드 이미지 형식(🟢 본 페이즈 D-11로 종결), 모션(🟢 본 페이즈 D-02로 종결).
- `.planning/phases/02-tab-bar-navigation-shell/02-CONTEXT.md` — Phase 2 결정. 본 페이즈 carry-forward: P2-D-01(`/tarot` 라우트), P2-D-04(TarotPage 단일 라우트 + currentPage 패턴), P2-D-05(라우트별 탭바 숨김 — `/tarot`은 표시).

### 외부 프로토타입 자산 (실 파일)

- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/routes/index.tsx` — intro 단계 패턴 참고.
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/routes/shuffle.tsx` — 부채꼴 3장 패턴 + `pickRandomCardId` 로직 (포팅 대상).
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/routes/result.tsx` — 결과 화면 구조 참고 (RatingWidget 등 Out-of-scope 제외).
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/components/TarotCardArt.tsx` — 카드 시각화 핵심 (TS→JSX 포팅 + Tailwind→Emotion/inline style).
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/data/cards.ts` — 22장 카드 데이터 (이름·영문명·이모지·키워드·메시지) → tarot_cards seed로 추출.
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/store/tarot.ts` — zustand 스토어 (참고용, useState/Context로 재구현).
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/public/cards/00.webp ~ 21.webp` — 카드 이미지 22장 (D-11 그대로 복사).

### fortune-cat 측 통합 지점

- `src/pages/TarotPage.jsx` — Phase 2가 만든 빈 컨테이너 + `currentPage = 'intro'` 상태. 본 페이즈가 `'intro' | 'shuffle' | 'result'` 상태 머신으로 확장.
- `src/components/TabBar.jsx` — Phase 2 산출. `/tarot`에서 표시(P2-D-05). 본 페이즈에서는 변경 없음.
- `src/lib/supabase.js` — 본 페이즈에서 `tarot_cards` 조회 함수 추가(`getMenuImageUrl`/`fetchAmuletTypes` 등 메뉴 테이블 조회 패턴 참고).
- `src/pages/SajuPage.jsx`, `src/pages/AmuletPage.jsx` — currentPage 상태 머신 패턴 참고.
- `src/pages/HomePage.jsx` — Promise.all + setHasError + useToast 에러 처리 패턴 (D-10 참고).
- `src/components/Loading.jsx` — 일반 로딩 스피너 패턴 (intro fetch 시 참고).
- `src/utils/markdown.jsx` — 카드 메시지 텍스트 렌더링 시 활용 가능 (현재 plain text 사용).
- `scripts/*.sql` — Supabase 마이그레이션 SQL 위치. 본 페이즈에서 `scripts/<날짜>_create_tarot_cards.sql` 추가.
- `src/assets/images/` — 풀이 일러스트 정적 임포트 패턴. 본 페이즈에서 `src/assets/images/cards/` 신규 디렉토리 추가.

### 외부 SDK / 플랫폼 문서

- Apps-in-Toss 개발자센터 — `https://developers-apps-in-toss.toss.im/development/llms.html` (LLM 친화 문서).
- Supabase JS SDK — fortune-cat 기존 import 패턴 참고 (`@supabase/supabase-js` 2.86).
- Vite 정적 자산 처리 — WebP `.webp` 정적 임포트 지원 (`import card from './00.webp'` 형태).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (포팅 시 재사용 가능)

- **`src/lib/supabase.js`** — Supabase 클라이언트 + 메뉴 테이블 조회 패턴 (`amulet_types`, `ai_saju_types`). `tarot_cards` 조회는 동일 패턴.
- **`src/pages/HomePage.jsx`** — `Promise.all` 데이터 fetch + 에러 핸들링(`setHasError` + `openToast` + 재시도 버튼) — D-10 모델.
- **`src/components/Loading.jsx`** — 로딩 스피너 컴포넌트 (intro fetch 중 사용 가능).
- **`src/hooks/useToast.jsx`** — 에러 토스트 알림 (D-10 fallback).
- **`src/utils/markdown.jsx`** — 카드 메시지를 추후 markdown으로 확장하고 싶을 때 활용.
- **`@toss/tds-colors`** — TDS 컬러 토큰 (배경·텍스트·키워드 chip 색상).
- **`@toss/tds-mobile`** — TDS Mobile 컴포넌트 (Button·Text 등 사용 가능).
- **CSS `transform: rotateY` + `transition`** — 카드 뒤집기·부채꼴 펼침 (D-02·D-01) — 신규 의존성 0.

### Established Patterns (포팅을 제약·인도)

- **`currentPage` 상태 머신**: `SajuPage`/`AmuletPage`/`NewYearPage`가 단일 라우트 안에서 단계별 화면을 전환. 본 페이즈는 `TarotPage`에 `intro → shuffle → result` 적용 (P2-D-04 carry-forward).
- **메뉴 테이블 모델**: `ai_saju_types`/`amulet_types` 등은 (id, title, image_path, ...) 형태로 Supabase에 보관 → 클라이언트에서 조회. `tarot_cards`도 동일 모델 (D-08).
- **정적 일러스트 임포트**: 풀이 일러스트가 `src/assets/images/`에 정적 import. 카드 이미지도 같은 패턴 (D-11).
- **Context 기반 글로벌 상태**: `SessionContext`/`ToastContext`/`AnonymousKeyContext` 패턴. 본 페이즈는 useState로 시작하고 Phase 4·5에서 필요 시 Context로 승격 (Claude's Discretion).
- **graceful degradation**: 광고/Analytics 실패가 핵심 흐름을 막지 않음 (Phase 4 설계 시점에 적용. Phase 3는 광고 없음).
- **AIT 심사·번들 영향 최소화**: 신규 의존성 0 (P1-D-08 + 본 페이즈 D-02 재확인).

### Integration Points (신규 코드가 연결될 지점)

- **`src/pages/TarotPage.jsx`** — Phase 2 빈 컨테이너에 `intro/shuffle/result` 단계 + 22장 카드 fetch + currentPage 라우팅 + 다시 뽑기 액션.
- **`src/components/TarotCardArt.jsx`** (신규) — 카드 시각화 컴포넌트 (boknyang-tarot의 `TarotCardArt.tsx` 포팅 대상). 앞/뒷면 + 이미지 + framed 스타일링.
- **`src/lib/supabase.js`** — `fetchTarotCards()` 함수 추가 (메뉴 테이블 조회 패턴).
- **`src/assets/images/cards/`** (신규) — 22장 `.webp` 정적 임포트.
- **`src/assets/images/cards/index.js`** (신규, 권장) — `getCardImageUrl(id) → import 경로` 매핑 헬퍼 (Claude's Discretion).
- **`scripts/<날짜>_create_tarot_cards.sql`** (신규) — Supabase 마이그레이션 + 22장 seed.

</code_context>

<specifics>
## Specific Ideas

- **메시지 톤 유지:** 프로토타입 `cards.ts`의 "~다냥" 마스코트 톤을 그대로 유지 (Phase 1 specifics carry-forward). 4050 여성 사용자가 친숙하게 받아들임.
- **카드별 메시지 길이:** ~300자 (프로토타입 표준). 결과 화면에서 스크롤 없이 한 페이지에 들어가도록.
- **부채꼴 펼침 시각:** 프로토타입 `shuffle.tsx`를 시각적으로 확인하고, fortune-cat의 디자인 톤(밝은 베이지·라벤더 계열)에 맞춰 조정. 정확한 각도·여백은 Claude's Discretion.
- **카드 이미지 위치 일관성:** `src/assets/images/cards/00.webp` ~ `21.webp` 형태로, 기존 `src/assets/images/{fortune_type}.png` 패턴과 분리하여 카드 전용 디렉토리.
- **가독성 우선 폰트 사이즈:** 메시지 본문은 16-17px, 줄간격 1.5-1.6, 4050 사용자 기준 충분한 대비.
- **카드 이미지 형식 정정 트래커블:** Phase 1 GAPS.md "카드 이미지 형식" 행이 본 페이즈 D-11로 종결되었음을 SUMMARY.md `Resolved Cross-Phase Items`에 기록.

</specifics>

<deferred>
## Deferred Ideas

다음 항목들은 본 페이즈에서 다루지 않으나, 기록한다.

### 다음 페이즈로 이월

- **광고 시청 게이팅** ('다시 뽑기' 클릭 시 광고 호출) — Phase 4 책임. SC3 명시.
- **Firebase Analytics 이벤트** (탭 진입·카드 뽑기·다시 뽑기·공유) — Phase 5 책임.
- **토스 공유 시트** (결과 공유) — Phase 5 책임.

### 본 마일스톤 외 후보

- **archive (카드 히스토리)** — 데일리 원카드 1종 정책 (Phase 1 D-04 기록만). 다음 마일스톤 후보.
- **`tarot_cards` 운영 메타데이터** (`updated_at`/`is_active`/`sort_order`) — 시즌 콘텐츠 교체 필요 시점에 마이그레이션 추가.
- **카드 뒷면 디자인 다양화** (시즌별 뒷면 변경 등) — v1.2 이후.
- **카드별 키워드를 클릭 시 해석 확장 (인터랙티브 카드)** — 다음 마일스톤 후보.
- **'오늘의 카드' 하루 1회 잠금 정책** (같은 날 같은 카드 고정) — 본 페이즈는 매번 새로 뽑기. 광고 모델 검증 후 재검토 가능.
- **사주 ↔ 타로 데이터 통합** — REQUIREMENTS.md `CROSS-01` (다음 마일스톤 후보).

### Phase 3 종료 시 cleanup 작업 (없음)

- PROJECT.md 갱신 필요 사항 없음 (Phase 2에서 이미 `/tarot` 라우트 항목 정리됨).

</deferred>

---

*Phase: 03-daily-one-card-core*
*Context gathered: 2026-05-02*
