# Phase 1: 타로 프로토타입 발굴 및 포팅 평가 - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning

<domain>
## Phase Boundary

외부 레포의 타로 프로토타입을 식별·평가해, fortune-cat에 통합 가능한 자산(카드 데이터, 인터랙션, 해석 텍스트)과 포팅 시 갭(디자인 시스템·의존성·라우팅)을 명확히 한다. **준비/조사 페이즈로 코드 작성은 없다 — 산출물은 평가 문서.** 실제 포팅·통합 작업은 Phase 2~5에서 진행한다.

</domain>

<decisions>
## Implementation Decisions

### 프로토타입 정본 출처

- **D-01:** v1.1 데일리 원카드 정본 프로토타입은 **`boknyang-tarot`** 으로 확정한다.
  - 경로: `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/`
  - 선정 이유: TDS Mobile/AIT (`@toss/tds-mobile`, `@toss/tds-mobile-ait`), React 18, granite/ait 빌드 — fortune-cat의 스택과 동일.
- **D-02:** `cattaro/fortune-cat-tarot` (TanStack Start + React 19 + Cloudflare)은 **사용하지 않는다.** 디자인/문구 영감을 찾고 싶을 때만 선택적으로 참고하되, 자산 포팅의 베이스가 되지 않는다.

### Phase 1 자산 인벤토리 범위

- **D-03:** 인벤토리는 **데일리 원카드 핵심 + 탭바 관련 자산**까지 포함한다.
  - In-scope (포팅 평가 대상):
    - 라우트 3개: `index` (진입), `shuffle` (뒤집기/선택), `result` (결과)
    - 컴포넌트: `TarotCardArt` (카드 시각화 핵심), `BottomNav` (Phase 2 탭바 참고용)
    - 데이터: `src/data/cards.ts` (메이저 아르카나 22장), `public/cards/00.png ~ 21.png`
    - 라이브러리/스토어 중 데일리 원카드 흐름에서 호출되는 부분만 (`store/tarot.ts`, `lib/utils.ts` 등)
  - Out-of-scope (이번 마일스톤 평가 제외):
    - 라우트: `archive` (카드 아카이브)
    - 컴포넌트: `RatingWidget`, `Particles`, `Boknyang` 마스코트
    - 라이브러리: `lib/ratings.ts`, `lib/track.ts`, `lib/session.ts` 중 데일리 원카드와 직접 무관한 부분
- **D-04:** Out-of-scope 항목은 인벤토리에 "Reviewed but excluded" 형태로 기록만 남긴다 — 다음 마일스톤 후보 자료로 활용 가능하도록.

### 평가 깊이 / Phase 1 산출물 형태

- **D-05:** Phase 1 산출물은 **자산 인벤토리 + 갭 매트릭스** 두 축으로 작성한다.
  - 자산 인벤토리: 프로토타입 자산을 표 형태로 (파일/역할/포팅 여부/대응 fortune-cat 위치).
  - 갭 매트릭스: 스택·의존성·라우팅 관점에서 충돌 항목을 표 형태로 (충돌 항목/충돌 강도/해결 전략).
  - 컴포넌트별 1:1 매핑 표 / ADR은 **이번 페이즈에서 작성하지 않는다** — Phase 2~5에서 필요 시점에 결정.

### 카드 자산 보관 위치

- **D-06:** **카드 이미지 22장**은 `src/assets/images/cards/` 에 **정적 임포트**로 둔다.
  - fortune-cat의 풀이 일러스트(`src/assets/images/`) 패턴과 동일.
  - 파일명 규칙은 프로토타입과 일치시켜 `00.png ~ 21.png` 형태 유지(메이저 아르카나 ID).
- **D-07:** **카드 해석 텍스트**(이름/영문 이름/이모지/키워드/메시지)는 **Supabase 테이블** `tarot_cards` 에 둔다.
  - fortune-cat의 메뉴 테이블 패턴(`ai_saju_types`, `new_year_fortune_types`, `saju_reading_types`, `amulet_types`)과 일관.
  - 운영 중 메시지 수정/시즌 콘텐츠 교체 가능, 향후 주제별·스프레드 확장 시 같은 테이블 모델로 확장 용이.
  - 권장 컬럼: `id`, `name_ko`, `name_en`, `emoji`, `image_path`, `keywords` (text[]), `message`. 정확한 스키마는 Phase 3에서 마이그레이션 계획 시 확정.

### 포팅 전략 (의존성 처리)

- **D-08:** 프로토타입 의존성은 **fortune-cat 패턴으로 전면 재구현**한다.
  - `Tailwind v4` → Emotion (`@emotion/react`)
  - `zustand` → React Context API + `useState` (현재 `SessionContext`/`ToastContext`/`AnonymousKeyContext` 패턴)
  - `Radix UI primitives` → TDS Mobile (`@toss/tds-mobile`, `@toss/tds-mobile-ait`)
  - `TypeScript (.tsx)` → JavaScript (`.jsx`)
  - `TanStack Router` → React Router DOM (이미 fortune-cat이 사용)
  - 신규 의존성은 추가하지 않는다 (TDS Mobile/AIT 디자인 일관성 + AIT 심사 영향 최소화).
- **D-09:** **`framer-motion` 도입 여부는 Phase 1에서 결정하지 않는다.** 카드 뒤집기·셔플 모션의 UX 핵심도가 높으므로 Phase 2(탭바 셸) 또는 Phase 3(데일리 원카드 코어)에서 "TDS 기본 트랜지션으로 가능 여부"를 우선 검토한 뒤, 불가피한 경우에만 도입.

### 라우팅 통합 방식

- **D-10:** 타로 흐름은 **단일 라우트 + `currentPage` 상태 머신** 패턴으로 구현한다.
  - 기존 `SajuPage.jsx`/`AmuletPage.jsx`의 `currentPage` 패턴(`userInfo` → `photoUpload` → `loading` → `result` 등) 그대로 차용.
  - 예시: `TarotPage` 안에서 `intro` → `shuffle` → `result` 단일 라우트 내부 전환.
  - PROJECT.md "별도 `/tarot` 라우트 추가 금지" 제약과 부합.
  - 탭바(Phase 2)는 React Router DOM 라우트 위에 얹는 UI 셸로 구현(별개 결정 — Phase 2에서 구체화).

### Claude's Discretion

- 자산 인벤토리 표·갭 매트릭스의 구체적인 컬럼·서식 (markdown 표, 행 배열).
- 인벤토리·갭 매트릭스를 단일 문서에 둘지, 별도 두 문서로 분리할지의 미세 구조 결정.
- `boknyang-tarot` 코드를 깊이 읽어가며 발견되는 추가 충돌 항목의 갭 매트릭스 등재 기준.
- 카드 이미지 파일 권한·정렬·확장자 변환 검토(예: WebP 변환 권장 여부).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents (researcher, planner) MUST read these before planning or implementing.**

### 프로젝트 컨텍스트

- `.planning/PROJECT.md` — 비전/Core Value/제약, 타로 통합 Key Decisions(탭바 통합, 광고 기반 무제한, 데일리 원카드 1종, 프로토타입 포팅, 인프라 재사용)
- `.planning/REQUIREMENTS.md` — v1.1 요구사항 14개(NAV/TAROT/ADS/SHARE/ANL), Out of Scope 표, Phase별 traceability
- `.planning/ROADMAP.md` — Phase 1~5 정의 및 Phase 1 Success Criteria 4개
- `.planning/STATE.md` — Open Todos(프로토타입 경로 확인, 카드 자산 보관 위치 결정 — 본 CONTEXT.md에서 모두 해소됨)

### 기존 코드베이스 분석 (이전 매핑 산출물)

- `.planning/codebase/STRUCTURE.md` — fortune-cat 디렉토리/파일 레이아웃, 라우트↔페이지 매핑
- `.planning/codebase/STACK.md` — 의존성 버전, 환경 변수, 빌드 산출물 (`fortune-cat.ait`)
- `.planning/codebase/CONVENTIONS.md` — 네이밍/스타일/import 순서/에러 처리 패턴
- `.planning/codebase/ARCHITECTURE.md` — 페이지 흐름, Context/Provider 구조
- `.planning/codebase/INTEGRATIONS.md` — Supabase/Firebase/Sentry/AdMob 통합 지점
- `.planning/codebase/CONCERNS.md` — 알려진 정리 필요 사항(lockfile 일원화, .DS_Store)
- `.planning/codebase/TESTING.md` — 현재 테스트 상태(있다면)

### 외부 프로토타입 자산 (실 파일)

- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/` — 정본 프로토타입 루트
  - `src/data/cards.ts` — 메이저 아르카나 22장 데이터(이름/이모지/키워드/메시지)
  - `src/routes/{index,shuffle,result,archive}.tsx` — 라우트 4개 (archive는 out-of-scope)
  - `src/components/{TarotCardArt,BottomNav}.tsx` — 핵심 컴포넌트 + 탭바 참고용
  - `src/store/tarot.ts` — 상태(zustand → Context로 재구현 대상)
  - `public/cards/` — 카드 이미지 22장 (`00.png ~ 21.png`)
  - `granite.config.ts` — AIT 빌드 설정 비교용
  - `package.json` — 의존성 충돌 매트릭스 산출의 입력

### fortune-cat 측 통합 지점 (포팅 시 참고)

- `src/App.jsx` — 라우터 구조, Provider 래핑 — 탭바 셸 통합은 Phase 2 결정
- `src/pages/SajuPage.jsx`, `src/pages/AmuletPage.jsx` — `currentPage` 상태 머신 패턴 (D-10 참조)
- `src/components/Loading.jsx`, `src/components/DeepReadingLoading.jsx` — 광고 게이팅 패턴 (Phase 4에서 재사용)
- `src/lib/firebase.js` — `logEvent` 패턴 (Phase 5에서 재사용)
- `src/lib/supabase.js` — Supabase 클라이언트 + 메뉴 테이블 조회 패턴
- `src/hooks/useAnonymousKey.jsx` — Toss 익명키 (광고/Analytics에서 재사용)
- `scripts/*.sql` — Supabase 마이그레이션 SQL 위치(Phase 3에서 `tarot_cards` 마이그레이션 추가 시 참고)

### 외부 SDK / 플랫폼 문서

- Apps-in-Toss 개발자센터 — `https://developers-apps-in-toss.toss.im/development/llms.html` (LLM 친화 문서)
- TDS Mobile — `node_modules/@toss/tds-mobile`(컴포넌트 카탈로그) — boknyang-tarot의 Radix 컴포넌트 → TDS 매칭 시 참조

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (포팅 시 재사용 가능)

- **`src/components/Loading.jsx`, `DeepReadingLoading.jsx`** — 광고 시청 게이팅 패턴. Phase 4에서 데일리 원카드 광고 게이팅 시 재사용.
- **`src/lib/firebase.js` `logEvent`** — Phase 5의 4종 타로 이벤트(진입/뽑기/광고/공유) 기록에 재사용.
- **`src/hooks/useAnonymousKey.jsx`** — 광고 그룹 ID·Analytics user identification에 재사용.
- **`src/lib/supabase.js` 메뉴 테이블 조회 패턴** — `tarot_cards` 테이블 조회를 동일 패턴으로 작성.
- **`src/utils/markdown.jsx`** — 카드 메시지 텍스트(현재 plain text, 추후 markdown 가능)에 활용 가능.
- **토스 공유 시트 (`@apps-in-toss/web-framework`)** — Phase 5의 결과 공유에 재사용.

### Established Patterns (포팅을 제약·인도)

- **`currentPage` 상태 머신**: `SajuPage`/`AmuletPage`/`NewYearPage`가 단일 라우트 안에서 단계별 화면을 전환하는 패턴. 타로도 동일하게 구현(D-10).
- **메뉴 테이블 모델**: `ai_saju_types` 등은 (id, title, description, image_url, …)을 Supabase 테이블에 보관하고 클라이언트에서 조회. `tarot_cards`도 같은 모델을 따름(D-07).
- **정적 일러스트 임포트**: 풀이 종류 일러스트는 `src/assets/images/`에 정적 import. 카드 이미지도 같은 패턴(D-06).
- **Context 기반 글로벌 상태**: `SessionContext`/`ToastContext`/`AnonymousKeyContext` — 타로 상태도 Context+useState로 구성(D-08).
- **광고/Analytics graceful degradation**: 광고 실패가 풀이를 막지 않는 v1.0 정책 — Phase 4에서 동일하게 적용.

### Integration Points (신규 코드가 연결될 지점)

- **`src/App.jsx`** — 탭바 셸(Phase 2)이 들어갈 곳. 기존 라우트 4개(`/`, `/saju`, `/new-year`, `/amulet`)와 공존해야 함.
- **`src/pages/`** — 신규 `TarotPage.jsx` (단일 라우트, 내부 `currentPage` 상태 머신).
- **`src/components/`** — `TarotCardArt`(또는 fortune-cat 명명 규칙으로 재명명)·탭바 컴포넌트가 추가됨.
- **`src/lib/supabase.js`** — `tarot_cards` 조회 함수 추가.
- **`scripts/*.sql`** — `tarot_cards` 테이블 + seed 22장 마이그레이션 SQL (Phase 3에서 작성).
- **`src/assets/images/cards/`** — 22장 PNG 카드 이미지 위치(Phase 1에서 인벤토리 식별 → Phase 3에서 실제 복사).

</code_context>

<specifics>
## Specific Ideas

- 프로토타입 `cards.ts`의 "~다냥" 톤은 **그대로 유지**한다 — 4050 여성 사용자가 친숙하게 받아들이는 마스코트 톤. 메시지 길이도 유지(카드별 ~300자).
- 라우트 합성 패턴은 fortune-cat의 `SajuPage.jsx`(`userInfo` → `photoUpload` → `loading` → `result`) 와 정확히 일치하는 형태로 만든다.
- 갭 매트릭스의 충돌 강도 분류는 본 CONTEXT.md 영역 3 표(🔴 라우팅, 🟡 스타일/언어/상태/UI, 🟢 모션/아이콘)와 동일한 색상 표기를 따른다.

</specifics>

<deferred>
## Deferred Ideas

다음 항목들은 v1.1 마일스톤에서는 다루지 않으나, 인벤토리에 "Reviewed but excluded"로 기록한다.

### 다음 마일스톤 후보

- **archive 라우트 (카드 아카이브)** — 데일리 원카드 1종 한정 정책으로 v1.1 제외. 차후 사용자별 카드 히스토리 기능 검토 시 이 자산 재활용 가능.
- **RatingWidget** — 카드 결과 만족도 평가. v1.2 이후 PMF 측정 도구로 검토 가능.
- **Particles 시각 효과** — 카드 뽑기 인터랙션 강화. framer-motion 도입과 함께 검토 가능(Phase 2/3에서 우선 평가).
- **Boknyang 마스코트 컴포넌트** — 캐릭터 IP 활용. 별도 디자인/브랜드 검토 단계 필요.
- **주제별 타로 리딩 (연애/금전/취업)** — REQUIREMENTS.md `THEME-01/02` (다음 마일스톤 후보).
- **스프레드 리딩 (3장/5장)** — REQUIREMENTS.md `SPREAD-01`.
- **타로 결제 상품 (부적/굿즈/딥리딩)** — REQUIREMENTS.md `PAY-01/02`.
- **사주 ↔ 타로 데이터 통합** — REQUIREMENTS.md `CROSS-01`.

### Phase 2/3에서 결정해야 할 미확정 항목

- **`framer-motion` 도입 여부 (D-09)** — TDS 기본 트랜지션으로 카드 뒤집기·셔플 가능 여부를 우선 검토 후 결정.
- **탭바 셸의 라우터 위 통합 방식** — Phase 2 (`UI hint: yes`)에서 디자인 contract와 함께 확정.
- **`tarot_cards` 정확한 스키마** — Phase 3 마이그레이션 작성 시점에 확정.
- **카드 이미지 파일 포맷(PNG vs WebP)·압축 수준** — Phase 3 자산 복사 시점에 결정.

### 마일스톤 내 옵션 (우선순위 낮음)

- `pnpm-lock.yaml` + `package-lock.json` 일원화.
- `.DS_Store` `.gitignore` 보강.

</deferred>

---

*Phase: 01-tarot-prototype-evaluation*
*Context gathered: 2026-04-30*
