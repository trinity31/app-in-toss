---
phase: 02-tab-bar-navigation-shell
reviewed: 2026-04-30T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/components/TabBar.jsx
  - src/pages/TarotPage.jsx
  - src/App.jsx
findings:
  critical: 0
  warning: 1
  info: 4
  total: 5
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-04-30
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 2의 핵심 목표(하단 탭바 셸 + `/tarot` 라우트 추가, 신규 의존성 0개, 기존 흐름 회귀 없음)는 정확히 달성되었다. React Router DOM 7의 `useLocation`/`useNavigate`/`<Routes>` 사용 패턴이 표준 방식대로 올바르게 적용되었고, D-01~D-10 잠금 결정이 코드에 충실히 반영되었다.

검토에서 확인한 강점은 다음과 같다.

- **신규 의존성 0개:** `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`, `class-variance-authority` 모두 미사용 (P1-D-08, D-08 충족).
- **CSS transition 미사용:** `TabBar.jsx`에 `transition` 속성이 없어 D-10 즉시 전환 결정과 일치.
- **이벤트 핸들러 누수 위험 없음:** TabBar는 `onClick` 인라인 핸들러만 사용하고 `addEventListener`/`setTimeout`/`setInterval` 등 수동 등록이 없어 항상 마운트되어 있어도 누수 위험 없음. `useEffect`도 사용하지 않아 cleanup 부담이 없다.
- **회귀 방지:** `App.jsx`에서 기존 4개 라우트(`/`, `/saju`, `/newyear`, `/amulet`, `*`) 정의가 그대로 보존됨.
- **분기 결정 기록:** `TabBar.jsx` 1행에 D-07 (TDS Tab 부적합 → Emotion 폴백) 사유가 한 줄 주석으로 남아있어 의사결정 추적이 가능하다.

다만 `useLocation()` 기반 표시/숨김 판정이 `pathname === '/tarot'` 정확 매칭이라 `/tarot/anything` 같은 하위 경로에서 탭바가 사라지는 잠재적 회귀가 있다. 본 페이즈에서는 `/tarot` 단일 라우트만 사용하므로 즉시 영향은 없으나 Phase 3 이후 하위 라우트 도입 시 충돌 가능성이 있어 Warning으로 기록한다.

## Warnings

### WR-01: `/tarot` 하위 경로 진입 시 탭바 자동 숨김 (Phase 3 이후 잠재 회귀)

**File:** `src/components/TabBar.jsx:15, 127, 132`
**Issue:**
`VISIBLE_PATHS = new Set(['/', '/tarot'])`와 `isActive(to) => location.pathname === to`는 둘 다 **정확 일치(exact match)**다. Phase 2 한정으로는 D-04 (단일 라우트 + currentPage 패턴)에 따라 `/tarot` 단일 라우트만 사용하므로 문제 없다.

그러나 향후 누군가가 (a) 딥링크용으로 `/tarot/share/:id`처럼 하위 라우트를 도입하거나, (b) `<Route path="/tarot/*">` 형태로 nested routing을 사용하면 **하위 경로에서 탭바가 사라지고 active 강조도 실패**한다. CONTEXT D-04는 `/tarot/shuffle` 같은 추가 라우트를 금지하므로 의도된 제약이지만, `useLocation()` 코드 자체에는 이 가정이 명시되어 있지 않아 미래의 실수로 회귀가 발생할 수 있다.

또한 React Router 7에서는 `pathname`에 trailing slash가 붙는 환경(예: 일부 외부 진입)을 만나면 `/tarot/`로 들어와 `/tarot`과 매칭되지 않을 수 있다. 가능성은 낮지만 hardcoded 정확 매칭의 알려진 약점이다.

**Fix:**
현재 동작을 **유지하되 의도를 코드에 명시**하는 가벼운 방어가 권장된다. 두 가지 옵션 중 하나를 선택:

옵션 A — 정확 매칭 유지 + 주석으로 의도 고정:
```jsx
// D-04: /tarot 하위 라우트(/tarot/share, /tarot/result 등) 추가 금지.
// 탭바 표시·active 판정은 정확 매칭만 사용 — 하위 경로 진입 시 의도적으로 탭바 숨김.
const VISIBLE_PATHS = new Set(['/', '/tarot'])
```

옵션 B — startsWith 기반으로 변경(Phase 3에서 D-04 정책이 바뀔 경우):
```jsx
const isVisible = (path) =>
  path === '/' || path === '/tarot' || path.startsWith('/tarot/')
const isActive = (to) =>
  to === '/'
    ? location.pathname === '/'
    : location.pathname === to || location.pathname.startsWith(`${to}/`)
```

본 페이즈에서는 D-04를 준수하므로 **옵션 A(주석 보강)** 를 권장한다. Phase 3 이후 하위 경로가 필요해지면 옵션 B로 전환.

## Info

### IN-01: Inline style 패턴이 형제 페이지와 다소 상이 (단위 표기)

**File:** `src/pages/TarotPage.jsx:18-22, 25`
**Issue:**
`SajuPage.jsx`/`HomePage.jsx`/`TabBar.jsx`는 inline style에서 숫자 리터럴(`gap: 4`, `padding: 24`, `minHeight: 56`)을 자유롭게 쓰는 반면, `TarotPage.jsx`는 `padding: 24` (숫자)와 `fontSize: '16px'` (문자열) 두 표기를 혼용한다. React가 단위 없는 숫자를 자동으로 px로 처리하므로 동작상 차이는 없다. 다만 코드베이스 일관성과 DRY 관점에서 한 쪽으로 통일하는 것이 좋다 (`HomePage.jsx`/`TabBar.jsx`는 숫자 쪽을 선호).

**Fix:**
```jsx
<p style={{ fontSize: 16, color: '#666' }}>타로 준비 중</p>
// padding: 24, paddingBottom: 96 (이미 숫자로 통일되어 있음)
```
혹은 반대로 모두 문자열 `'24px'`/`'96px'`로 통일. 본 페이즈 한정 placeholder이므로 Phase 3에서 본격 구현 시 정리해도 무방.

### IN-02: 색상 토큰과 raw hex 혼용 (`'#ffffff'`, `'#666'`)

**File:** `src/components/TabBar.jsx:63, 64, 84` / `src/pages/TarotPage.jsx:25`
**Issue:**
`TabBar.jsx`는 active/inactive 컬러는 `colors.blue500`/`colors.grey500` (TDS 토큰)을 정확히 사용하지만, TarotIcon 내부의 카드 강조 fill/stroke는 raw hex `'#ffffff'`로, nav 배경도 `'#ffffff'`로 하드코딩되어 있다. `TarotPage.jsx`의 placeholder 텍스트도 `'#666'` 하드코딩.

D-09는 "TDS 컬러 토큰 + 아이콘 fill"을 명시하므로 `colors.white`/`colors.grey700` 같은 토큰이 있다면 그쪽이 더 일관적이다. 다만 흰색은 토큰화가 무의미할 수도 있고, placeholder는 Phase 3에서 교체될 예정이라 영향 적음.

**Fix:**
```jsx
// TabBar.jsx
const navStyle = {
  // ...
  background: colors.white ?? '#ffffff', // TDS에 colors.white 있으면 사용
}

// TarotIcon
fill={active ? (colors.white ?? '#ffffff') : 'none'}
stroke={active ? (colors.white ?? '#ffffff') : INACTIVE_COLOR}
```
Phase 3에서 TarotPage 본격 구현 시 placeholder 텍스트는 제거되므로 그쪽은 손대지 않아도 됨.

### IN-03: `currentPage` 상태가 setter 없이 선언됨 (의도된 placeholder)

**File:** `src/pages/TarotPage.jsx:8`
**Issue:**
`const [currentPage] = useState('intro')`는 setter를 destructure하지 않았다. ESLint `no-unused-vars`나 React Hooks 룰이 켜져 있다면 Phase 3 확장 시점에서 setter 추가가 누락될 수 있다. `data-current-page={currentPage}` 속성이 있어 변수 자체는 사용되므로 unused 경고는 발생하지 않는다.

CONTEXT/PLAN에서 이는 **의도된 Phase 3 확장 포인트 placeholder**임이 명시되어 있다. 다만 Phase 3 실행자가 `setCurrentPage`를 추가할 위치를 명확히 알 수 있도록 주석을 한 줄 보강하면 더 친절하다.

**Fix:**
```jsx
// Phase 3 확장 포인트:
// const [currentPage, setCurrentPage] = useState('intro')
// setCurrentPage('shuffle' | 'result')로 단계 전환.
const [currentPage] = useState('intro')
```
현재 7행 주석에 이미 비슷한 내용이 있으므로 필수는 아님.

### IN-04: SVG 아이콘 컴포넌트 두 개에 중복 패턴 (DRY)

**File:** `src/components/TabBar.jsx:22-70`
**Issue:**
`SajuIcon`과 `TarotIcon`이 `width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false"` 등 SVG wrapper 속성을 동일하게 반복한다. Phase 2 한정 2개 아이콘이라 영향이 작으나, Phase 3에서 추가 아이콘이 들어오거나 사이즈 토큰화가 필요해지면 DRY 위반이 누적된다.

CLAUDE.md 사용자 지침의 DRY 원칙과 부합하지 않지만, 2개 아이콘만 있는 현 시점에서는 추상화가 오히려 과한 측면이 있어 Info로만 기록.

**Fix (선택):**
```jsx
function IconWrapper({ children }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  )
}

function SajuIcon({ active }) {
  return (
    <IconWrapper>
      <path d="M12 2.5l..." fill={active ? ACTIVE_COLOR : 'none'} ... />
    </IconWrapper>
  )
}
```
Phase 3에서 아이콘이 늘어날 경우 적용 권장. 현재는 보류 가능.

---

_Reviewed: 2026-04-30_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
