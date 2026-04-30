# Phase 2: 하단 탭바 네비게이션 셸 - Context

**Gathered:** 2026-05-01
**Status:** Ready for planning

<domain>
## Phase Boundary

사주/타로 두 탭을 한 번의 탭으로 전환할 수 있는 **하단 탭바 셸**을 도입한다. 기존 사주 흐름(`/`, `/saju`, `/newyear`, `/amulet`)은 v1.0과 동일한 진입 경로·결과 화면으로 동작해야 한다 (회귀 없음). 본 페이즈에서는 **탭바 셸 + `/tarot` 라우트의 빈 컨테이너(placeholder)** 까지만 만든다 — 데일리 원카드 코어 UI(intro/shuffle/result)는 Phase 3에서 구현된다.

**산출물:** 탭바 컴포넌트 + `/tarot` 라우트 등록 + `App.jsx` 통합 + `TarotPage.jsx` 빈 컨테이너 + 라우트별 탭바 노출 제어.

</domain>

<decisions>
## Implementation Decisions

### 라우팅 통합 방식

- **D-01:** **`/tarot` 라우트를 신규 추가한다.**
  - 사주 탭 = `/`, 타로 탭 = `/tarot`.
  - 기존 사주 흐름 `/saju`·`/newyear`·`/amulet`는 그대로 유지.
  - **Prior decision override:** PROJECT.md `Out of Scope`의 "별도 신규 라우트 추가 (`/tarot` 경로 등) — 결제 흐름이 없는 한 탭바 전환만으로 충분"과 Phase 1 CONTEXT.md `D-10` ("PROJECT.md '별도 /tarot 라우트 추가 금지' 제약과 부합")을 본 결정으로 **명시적으로 뒤집는다.** 이유: URL로 타로/사주 구분이 가능해야 공유·딥링크·analytics 식별이 명확하고, `/tarot` 라우트 안에서 currentPage 상태 머신을 두는 형태가 기존 `SajuPage`/`AmuletPage` 패턴과 가장 일관됨. PROJECT.md `Out of Scope` 해당 항목은 Phase 2 종료 시 제거 필요(전환 단계 정리 작업).
- **D-02:** **탭바는 `App.jsx`의 `<Routes>` 바깥 outer shell**에 배치한다.
  - `main.jsx`의 `ThemeProvider`/Provider 체인 안쪽, `App` 컴포넌트 내부에서 탭바 컴포넌트와 `<Routes>`를 형제로 둔다.
  - 라우트 전환 시 탭바가 unmount/remount 되지 않아 상태가 유지되며, 탭바와 라우트 간 prop drilling 불필요.
- **D-03:** **탭 클릭 시 각 탭의 처음 화면으로 진입한다.**
  - 사주 탭 = `/` (HomePage 처음 화면, reset).
  - 타로 탭 = `/tarot` (TarotPage 처음 화면 = Phase 3에서 정의될 `intro` 단계).
  - "마지막으로 봤던 위치"로 복귀하지 않는다 (구현 단순성·4050 사용자 멘탈 모델 우선).
  - NAV-03 (기존 흐름 회귀 없음) 충족.

### 탭 라우트는 단일 라우트 + currentPage 패턴 유지

- **D-04:** Phase 1 `D-10`의 **단일 라우트 + `currentPage` 상태 머신** 패턴은 **유지한다.**
  - `/tarot` **단일 라우트** 안에서 Phase 3가 `currentPage = 'intro' → 'shuffle' → 'result'`로 전환한다. 셔플/결과를 별도 라우트로 분리하지 않는다.
  - 즉, 본 페이즈가 추가하는 라우트는 `/tarot` 1개뿐이다 (`/tarot/shuffle` 등 추가 라우트 금지).
  - Phase 1 `D-10`의 두 기둥 중 "단일 라우트 + currentPage"는 유지되고, "별도 라우트 추가 금지"는 D-01에서 오버라이드된 형태.

### 탭바 노출 정책

- **D-05:** 탭바는 **라우트별 숨김** 정책을 따른다.
  - **표시:** `/`, `/tarot`
  - **숨김:** `/saju`, `/newyear`, `/amulet`
  - 판정은 `App.jsx`에서 `useLocation()` 으로 단순 비교.
  - 페이지 내부 `currentPage`별 추가 숨김 규칙은 도입하지 않는다 — 라우트 단위 숨김으로 SC4 (풀스크린 흐름 가리지 않기) 충족.
- **D-06:** 탭바 **높이·safe-area-inset-bottom 처리는 TDS Mobile 기본 패턴**을 채택한다.
  - 자체 높이 지정·safe-area 계산 금지 (TDS 토큰·컴포넌트 기본값 그대로).
  - iPhone 홈 인디케이터 회피는 TDS가 자동 처리.

### 탭 시각화 디자인

- **D-07:** 탭바 **컴포넌트는 TDS Mobile TabBar/BottomNav 컴포넌트를 우선 사용**한다.
  - Phase 2 실행 시작 시 `node_modules/@toss/tds-mobile`·`@toss/tds-mobile-ait` 카탈로그에서 `TabBar`·`BottomNav`·`TabNavigation` 등 유사 명칭 컴포넌트를 grep으로 식별한다.
  - **존재 시:** 해당 TDS 컴포넌트 사용 (D-08 신규 의존성 추가 금지 충족).
  - **부재 시:** Emotion + 기본 HTML(`nav` + `ul` + `li` + `button`)로 자체 제작. boknyang-tarot `BottomNav.tsx` 구조(active 판정 + flex 레이아웃)를 참고하되 Tailwind 클래스를 Emotion `css` prop으로 변환. `clsx`/`tailwind-merge`/`lucide-react` 등 신규 의존성은 추가하지 않는다.
  - 정확한 컴포넌트 선택은 Phase 2 실행자의 카탈로그 확인 결과에 따른다 (Claude's Discretion 일부).
- **D-08:** 탭 **아이콘은 TDS 아이콘 세트**에서 선택한다.
  - `@toss/tds-mobile` 또는 `@toss/tds-mobile-ait`이 제공하는 아이콘 컴포넌트에서 사주(예: 별·달·점성술 계열)와 타로(예: 카드·다이아몬드 계열)에 적합한 2개 선택.
  - **`lucide-react` 도입 금지** (Phase 1 `D-08` 신규 의존성 금지 + 본 결정 재확인).
  - TDS 아이콘에 적합한 2종이 없는 경우에 한해 SVG path 자체 정의 또는 카드 이미지/이모지 폴백 — 단, 아이콘 일관성을 위해 가능하면 TDS 세트 한정.
- **D-09:** **active 탭 강조 = 컬러 + 아이콘 fill.**
  - active: TDS 브랜드 컬러(예: `colors.blue500` 또는 fortune-cat 기존 컬러 토큰) + 아이콘 채움(filled variant).
  - inactive: TDS grey/muted 컬러 + 아이콘 stroke only(outlined variant).
  - 레이블 폰트 굵기는 동일 유지(컬러로만 구분) — 4050 사용자 대비는 컬러 contrast로 충족.

### 탭 전환 애니메이션

- **D-10:** **탭 전환은 즉시 전환** (트랜지션 없음).
  - 탭 클릭 시 React Router DOM의 `navigate()`로 즉시 라우트 변경. 페이지 페이드/슬라이드 트랜지션 도입하지 않는다.
  - active 탭 표시(컬러·아이콘 fill)에도 CSS `transition`을 의도적으로 두지 않는다 — 4050 사용자 명료성·구현 단순성 우선.
  - `framer-motion` 도입은 본 페이즈에서 결정하지 않는다 — Phase 3 카드 뒤집기(rotateY 180°)·셔플 구현 시점에 한꺼번에 결정 (Phase 1 `D-09` 보류 상태 유지).

### Claude's Discretion

- 탭바 컴포넌트의 정확한 명칭·import path (TDS 카탈로그 grep 결과로 결정 — D-07).
- 사주/타로 탭의 정확한 TDS 아이콘 선택 (D-08 후보 중 디자인 일관성 우선).
- active 컬러의 정확한 토큰값 (TDS 색상 토큰 또는 fortune-cat 기존 브랜드 컬러 — Phase 2 실행 시 디자인 일관성 검토 후 선택).
- `TarotPage.jsx` 빈 컨테이너의 placeholder 콘텐츠(예: "준비 중" 메시지·일러스트 — Phase 3에서 교체될 자리표시).
- 탭 클릭 시 active 탭을 다시 누른 경우 처리(현재 페이지에서 reset할지 무시할지 — D-03 정신 따라 reset 권장이나 세부는 Discretion).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents (researcher, planner) MUST read these before planning or implementing.**

### 프로젝트 컨텍스트

- `.planning/PROJECT.md` — 비전·Core Value·제약·Key Decisions. 본 페이즈 D-01은 PROJECT.md `Out of Scope`의 "별도 /tarot 라우트 금지"를 오버라이드하므로 phase transition 시점에 해당 항목 제거 필요.
- `.planning/REQUIREMENTS.md` — v1.1 요구사항. 본 페이즈 매핑: NAV-01 (탭 전환), NAV-02 (active 시각 강조), NAV-03 (기존 흐름 회귀 없음).
- `.planning/ROADMAP.md` — Phase 2 정의 + 4개 Success Criteria + Phase 3~5 의존 관계.
- `.planning/STATE.md` — 현재 진행 상황·세션 노트.

### Phase 1 산출물 (선행 결정 사항)

- `.planning/phases/01-tarot-prototype-evaluation/01-CONTEXT.md` — Phase 1 잠금 결정 D-01~D-10. 본 페이즈는 P1-D-08 (신규 의존성 금지), P1-D-10 (단일 라우트 + currentPage 패턴 유지)을 carry-forward 하고 "별도 /tarot 라우트 금지" 부분만 D-01로 오버라이드.
- `.planning/phases/01-tarot-prototype-evaluation/01-INVENTORY.md` — 프로토타입 자산 표. `BottomNav.tsx`(참고용) 행 + 라우트 행에서 본 페이즈 통합 지점 확인 가능.
- `.planning/phases/01-tarot-prototype-evaluation/01-GAPS.md` — 갭 매트릭스. **라우팅(🔴)** + **UI 프리미티브(🟡)** + **모션(🟢)** 행이 본 페이즈 직접 영향. "Phase 2 (하단 탭바 셸)" 후속 페이즈 영향 섹션 참조.

### 외부 프로토타입 자산

- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/components/BottomNav.tsx` — 탭바 패턴 참고 원본 (TanStack Router `Link` + `useLocation`, `lucide-react` 아이콘, Tailwind 스타일). **직접 포팅 아님 — 구조·active 판정 로직만 참고하고 TDS Mobile + Emotion으로 재구현.**
- `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/src/routes/__root.tsx` — TanStack Router root + Outlet + BottomNav 렌더 패턴 (참고). 본 페이즈는 React Router DOM `<Routes>` 바깥 형제로 배치하므로 동일 책임이지만 구현은 다름.

### fortune-cat 측 통합 지점

- `src/main.jsx` — Provider 체인 (`BrowserRouter` → `ThemeProvider` → `ToastProvider` → `AnonymousKeyProvider` → `SessionProvider` → `<App />`). 탭바는 `<App />` 안쪽에 위치하므로 모든 Provider 접근 가능.
- `src/App.jsx` — 현재 4개 라우트 정의(`/`, `/saju`, `/newyear`, `/amulet`, `*` → HomePage). 본 페이즈는 `/tarot` 라우트 추가 + 탭바 컴포넌트 통합.
- `src/pages/SajuPage.jsx`, `src/pages/AmuletPage.jsx` — `currentPage` 상태 머신 패턴 참고 (`TarotPage`도 동일 패턴 사용).
- `node_modules/@toss/tds-mobile` + `node_modules/@toss/tds-mobile-ait` — TabBar·BottomNav·아이콘 카탈로그 (Phase 2 실행 시 grep 대상).

### 외부 SDK / 플랫폼 문서

- Apps-in-Toss 개발자센터 — `https://developers-apps-in-toss.toss.im/development/llms.html` (LLM 친화 문서). 탭바·하단 인디케이터·safe area 가이드 참조.
- TDS Mobile 카탈로그 — `node_modules/@toss/tds-mobile` README/`d.ts`로 컴포넌트·토큰 확인.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (포팅 시 재사용 가능)

- **`src/main.jsx` Provider 체인** — 탭바는 `App` 내부에 위치하므로 ThemeProvider·ToastProvider·AnonymousKeyProvider·SessionProvider 그대로 접근 가능. 추가 Provider 도입 불필요.
- **React Router DOM 7.9.5** — `useLocation()`·`useNavigate()`로 라우트 판정 + 탭 클릭 처리. 신규 의존성 없음.
- **`@toss/tds-mobile` 2.1.2 + `@toss/tds-mobile-ait` 2.1.2** — TabBar/BottomNav/아이콘 우선 출처 (D-07/D-08).
- **`@emotion/react` 11.14.0** — TDS에 컴포넌트가 없을 때 자체 제작 폴백 스타일링.

### Established Patterns (포팅을 제약·인도)

- **`currentPage` 상태 머신:** 기존 `SajuPage`·`AmuletPage`·`NewYearPage`가 단일 라우트 안에서 단계별 화면을 전환. 본 페이즈는 `/tarot` 라우트를 추가하고 그 안에서 동일 패턴 유지(D-04). Phase 3가 `intro` → `shuffle` → `result` 단계 정의.
- **라우트 정의 위치:** 모든 라우트는 `src/App.jsx`에 `<Routes>` JSX로 선언. 본 페이즈는 `<Route path="/tarot" element={<TarotPage />} />` 행 추가 + `*` catch-all 위에 배치.
- **TDS Mobile 디자인 일관성:** 모든 UI 컴포넌트는 TDS Mobile 우선, 부족 시 Emotion 폴백. Phase 1 D-08 정신 carry-forward.
- **신규 의존성 금지:** Phase 1 D-08 carry-forward + 본 페이즈 D-08 재확인.

### Integration Points (신규 코드가 연결될 지점)

- **`src/App.jsx`** — `<Routes>` 추가(`/tarot`) + `<Routes>` 바깥에 탭바 컴포넌트 형제로 배치 + `useLocation()` 기반 표시/숨김 판정.
- **`src/components/TabBar.jsx`** (신설) — 탭바 컴포넌트. TDS TabBar 사용 시 얇은 wrapper, Emotion 폴백 시 자체 제작.
- **`src/pages/TarotPage.jsx`** (신설, 빈 컨테이너) — `/tarot` 라우트 매핑되는 페이지. `currentPage` 상태 머신의 `intro` 단계 placeholder만 두고 Phase 3에서 확장.
- **`src/config/` 또는 `src/components/TabBar.jsx` 내부** — 탭 정의 배열(`{ to, label, iconActive, iconInactive }`) 위치. 라우트별 숨김 규칙도 같은 파일 또는 `App.jsx`에 단순 배열로.

</code_context>

<specifics>
## Specific Ideas

- 탭 레이블은 **"사주" / "타로"** 로 고정(NAV-01에 명시).
- boknyang-tarot `BottomNav.tsx`의 active 판정 로직(`/`·`/shuffle`·`/result` 묶음)은 본 페이즈에 직접 적용 불가 — fortune-cat은 `/`(HomePage)와 `/tarot`이 명확히 분리됨.
- `TarotPage.jsx` 빈 컨테이너는 Phase 3에서 본격 구현되므로, Phase 2에서는 TDS 기본 컨테이너 + "준비 중" 정도의 placeholder만. 디자인 정밀도는 Phase 3 책임.
- 4050 여성 사용자 대비를 위해 active/inactive 컬러 contrast는 WCAG AA(4.5:1) 이상 권장 — TDS 토큰이 이를 만족함을 가정.

</specifics>

<deferred>
## Deferred Ideas

다음 항목들은 본 페이즈에서 다루지 않으나, 기록한다.

### 다음 페이즈로 이월

- **데일리 원카드 코어 UI** (`intro` → `shuffle` → `result` 단계) — Phase 3 책임. 본 페이즈는 `TarotPage.jsx` 빈 컨테이너만.
- **`framer-motion` 도입 여부** — Phase 3 카드 뒤집기·셔플 구현 시점에 한꺼번에 결정 (D-10 명시).
- **탭 전환 페이지 트랜지션 (페이드/슬라이드)** — 즉시 전환으로 시작(D-10), 추후 사용자 피드백 기반으로 재검토 가능.
- **active 탭을 다시 눌렀을 때 동작 (reset vs 무시)** — Claude's Discretion으로 표시. Phase 2 실행 시 결정 가능.

### 본 마일스톤 외 후보

- 탭 3개+ 확장 (예: 주제별 타로·스프레드 탭) — REQUIREMENTS.md `THEME-01/02`·`SPREAD-01` 다음 마일스톤 후보.
- 탭바 위에 알림 배지 표시 (예: 오늘 카드 안 뽑음 알림) — v1.1 스코프 외.
- 탭 길게 누르기 컨텍스트 메뉴 — v1.1 스코프 외.

### Phase 2 종료 시 cleanup 작업

- **PROJECT.md `Out of Scope` 섹션 갱신** — "별도 신규 라우트 추가 (`/tarot` 경로 등)" 항목 제거 (D-01 오버라이드 결과).
- **PROJECT.md `Key Decisions` 표 갱신** — "타로를 별도 라우트가 아닌 하단 탭바로 통합" 행은 부분적 유효 (탭바 통합은 유지, 별도 라우트는 추가됨) — Outcome 컬럼 갱신.

</deferred>

---

*Phase: 02-tab-bar-navigation-shell*
*Context gathered: 2026-05-01*
