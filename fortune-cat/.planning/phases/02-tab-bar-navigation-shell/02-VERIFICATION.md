---
phase: 02-tab-bar-navigation-shell
verified: 2026-04-30T00:00:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
gaps: []
human_verification:
  - test: "/saju, /newyear, /amulet 라우트 진입 시 탭바가 보이지 않는지 시각 확인"
    expected: "이 세 라우트에서 탭바가 화면에 노출되지 않는다 (D-05). 부적 결제·딥리딩 등 풀스크린 흐름이 가려지지 않아야 한다."
    why_human: "코드 단계에서 VISIBLE_PATHS Set 매칭으로 null 반환은 검증되었으나, 4050 사용자가 풀스크린 흐름을 사용하는 동안 실제로 탭바가 가리지 않는지의 시각·실사용 인지는 사용자 테스트 영역."
  - test: "/와 /tarot에서 탭 한 번 탭으로 즉시 전환되는지 확인 (NAV-01, SC1)"
    expected: "사주 탭 → / (HomePage), 타로 탭 → /tarot 으로 즉각(transition 없이) 전환된다. 4050 사용자가 한 번의 탭으로 인지 가능."
    why_human: "navigate() 호출은 코드로 검증 가능하나, 실제 클릭 → 라우트 전환 → 화면 갱신의 즉각성과 인지 가능성은 시각·UX 영역."
  - test: "active/inactive 컬러 + 아이콘 fill 대비가 4050 기준으로 충분한지 확인 (NAV-02, SC2)"
    expected: "active 탭은 colors.blue500 + 아이콘 fill, inactive는 colors.grey500 + 아이콘 stroke. 사용자가 어느 탭에 있는지 명확히 인지."
    why_human: "TDS 토큰 사용은 코드로 검증되나, 실제 디바이스에서의 시각적 대비·hit area·아이콘 의미 가독성(별=사주, 카드=타로)은 시각 검증 필요."
  - test: "기존 사주 흐름(/, /saju, /newyear, /amulet) 진입·결과 화면이 v1.0과 동일하게 동작 (NAV-03, SC3)"
    expected: "HomePage 메뉴 클릭 → 각 페이지의 currentPage 상태 머신 흐름이 v1.0과 동일하게 결과 화면까지 진행된다."
    why_human: "코드 무수정 검증은 git diff로 통과(0행)했으나, 실제 사용자 흐름(이름 입력 → 사진 업로드 → AI 풀이 결과 등)이 회귀 없이 동작하는지는 실사용 QA 영역."
  - test: "iPhone 홈 인디케이터/safe-area가 탭바를 가리지 않는지 확인 (D-06)"
    expected: "탭바의 padding-bottom: env(safe-area-inset-bottom)이 적용되어 iPhone 홈 인디케이터가 탭 버튼을 가리지 않는다."
    why_human: "CSS 단계에서 safe-area-inset-bottom 한 줄은 검증되나, 실제 iPhone 디바이스(notch/Dynamic Island)에서의 시각 가림 여부는 디바이스 테스트 영역."
---

# Phase 2: 하단 탭바 네비게이션 셸 Verification Report

**Phase Goal:** 사주/타로 두 탭을 한 번의 탭으로 전환할 수 있는 하단 탭바 셸을 도입하면서, 기존 사주 흐름(`/`, `/saju`, `/newyear`, `/amulet`)을 동일하게 유지한다 (회귀 없음)
**Verified:** 2026-04-30
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 사용자가 `/` 또는 `/tarot`에서 하단 탭바의 '사주'/'타로' 버튼을 한 번 탭하면 즉시 해당 라우트로 전환된다 (NAV-01, SC1) | ✓ VERIFIED | `TabBar.jsx:9-12` TABS 배열 정확히 2개 (`'사주'`→`/`, `'타로'`→`/tarot`), `useNavigate()` import + `handleTabClick(to) => navigate(to)` 호출 검증 (line 124, 135-137). `App.jsx:13-20` `<Route path="/tarot" element={<TarotPage />} />` 등록. |
| 2 | 사용자가 active 탭(컬러 + 아이콘 fill)과 inactive 탭(grey + 아이콘 stroke)을 시각적으로 명확히 구분할 수 있다 (NAV-02, SC2, D-09) | ✓ VERIFIED | `TabBar.jsx:18-19` ACTIVE_COLOR=`colors.blue500`, INACTIVE_COLOR=`colors.grey500`. 아이콘은 active 시 `fill={ACTIVE_COLOR}`, inactive 시 `fill="none"` + `stroke={INACTIVE_COLOR}` 분기 (line 33-34, 57-58, 63-64). 레이블 컬러 분기 (line 151). |
| 3 | 사용자가 `/saju`, `/newyear`, `/amulet` 라우트의 v1.0 흐름(진입 경로·결과 화면)을 v1.0과 동일하게 이용할 수 있다 — 회귀 없음 (NAV-03, SC3) | ✓ VERIFIED | `git diff 456f637 HEAD --name-only` — `src/pages/HomePage.jsx`, `src/pages/SajuPage.jsx`, `src/pages/NewYearPage.jsx`, `src/pages/AmuletPage.jsx`, `src/main.jsx`, `granite.config.ts`, `package.json`, `package-lock.json`, `pnpm-lock.yaml` 모두 0행 변경. `App.jsx`에서 5개 기존 라우트(`/`, `/saju`, `/newyear`, `/amulet`, `*`) 모두 1회씩 보존. `npm run build` exit 0 + `fortune-cat.ait` 7.1MB 생성. |
| 4 | 사용자가 `/saju`, `/newyear`, `/amulet`에서는 탭바가 보이지 않고, `/`와 `/tarot`에서만 탭바를 본다 (SC4, D-05) | ✓ VERIFIED | `TabBar.jsx:15` `VISIBLE_PATHS = new Set(['/', '/tarot'])`, line 127-129 `if (!VISIBLE_PATHS.has(location.pathname)) return null`. 단순 매칭으로 `/saju`/`/newyear`/`/amulet`에서 null 반환. (시각·실사용 인지는 human_verification로 이관) |
| 5 | 사용자가 `/tarot`에 진입하면 빈 컨테이너(Phase 3 placeholder)를 볼 수 있다 (D-01) | ✓ VERIFIED | `TarotPage.jsx:5-28` default export TarotPage, `useState('intro')` + placeholder 텍스트 `'타로 준비 중'` 렌더. `currentPage` 상태 변수가 Phase 3 확장 포인트로 마련됨 (D-04). |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/TabBar.jsx` | 라우트별 표시 판정 + 사주/타로 두 탭 + active 시각 강조 컴포넌트 | ✓ VERIFIED | 165행, default export TabBar. `useLocation`/`useNavigate` import (line 6). TABS 2개 (`사주`→`/`, `타로`→`/tarot`). VISIBLE_PATHS 라우트 숨김. SajuIcon/TarotIcon SVG 자체 정의. |
| `src/pages/TarotPage.jsx` | /tarot 라우트의 빈 컨테이너 (Phase 3에서 currentPage 상태 머신으로 확장) | ✓ VERIFIED | 28행, default export TarotPage. `useState('intro')` (line 8). Phase 3 확장 포인트 주석 (line 1, 6-7). `'타로 준비 중'` placeholder. |
| `src/App.jsx` | /tarot 라우트 추가 + `<Routes>` 바깥에 TabBar 형제로 통합 | ✓ VERIFIED | 26행. `import TarotPage` (line 6), `import TabBar` (line 7). `<Route path="/tarot" element={<TarotPage />} />` (line 18). React Fragment(`<>...</>`)로 감싸서 `<TabBar />`를 `</Routes>` 다음 형제로 배치 (line 12-23). 사용하지 않던 `Navigate` import 제거 완료. |

**gsd-tools verify artifacts:** all_passed=true (3/3)

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|---------|---------|
| `src/App.jsx` | `src/components/TabBar.jsx` | `<Routes>` 바깥의 sibling JSX (TabBar는 Routes와 형제) | ✓ WIRED | `awk '/<Routes>/,/<\/Routes>/' src/App.jsx \| grep -c TabBar` = 0 (Routes 내부에 없음). `grep -c "<TabBar" src/App.jsx` = 1 (Routes 바깥에 1회 — line 21). gsd-tools 검증 통과. |
| `src/App.jsx` | `src/pages/TarotPage.jsx` | `<Route path="/tarot" element={<TarotPage />} />` | ✓ WIRED (수동 검증) | `grep -c "TarotPage" src/App.jsx` = 2 (import line 6 + JSX line 18). `<Route path="/tarot" element={<TarotPage />} />`가 line 18에 정확히 등록. (gsd-tools가 false negative 반환 — 패턴 매칭 한계, 수동 grep으로 wired 확정) |
| `src/components/TabBar.jsx` | `react-router-dom` | `useLocation()` + `useNavigate()` — 라우트 판정과 전환 | ✓ WIRED | `grep -E "useLocation\|useNavigate" src/components/TabBar.jsx \| wc -l` = 3 (import + 2 호출). gsd-tools 검증 통과. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|--------------|--------|---------------------|--------|
| `src/components/TabBar.jsx` | `location.pathname` | `useLocation()` from react-router-dom | Yes — React Router DOM이 BrowserRouter 컨텍스트에서 실제 경로 제공 | ✓ FLOWING |
| `src/components/TabBar.jsx` | `TABS` 배열 | 모듈 상수 (line 9-12) | Yes — `[{to: '/', label: '사주'}, {to: '/tarot', label: '타로'}]` 정확한 2개 항목 | ✓ FLOWING |
| `src/pages/TarotPage.jsx` | `currentPage` | `useState('intro')` (line 8) | Yes — 'intro' 상수값. Phase 3 확장 포인트로 의도된 placeholder. | ✓ FLOWING (의도된 placeholder) |

**참고:** TarotPage는 Phase 2 책임이 빈 컨테이너 + Phase 3 확장 포인트 마련이므로 `'타로 준비 중'` placeholder 텍스트는 의도된 stub (D-01·D-04 명시).

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 빌드 성공 (NAV-03 회귀 없음) | `npm run build` | exit 0, `fortune-cat.ait` 7.1MB 생성, 656 modules transformed, ✓ built in 9.18s | ✓ PASS |
| 5개 기존 라우트 정의 보존 | `grep -c 'path="/" element={<HomePage' src/App.jsx`, `path="/saju"`, `path="/newyear"`, `path="/amulet"`, `path="\*"` 각각 카운트 | 1, 1, 1, 1, 1 (모두 유지) | ✓ PASS |
| TabBar Routes 바깥 배치 (D-02) | `awk '/<Routes>/,/<\/Routes>/' src/App.jsx \| grep -c "TabBar"` | 0 (Routes 내부에 TabBar 없음) | ✓ PASS |
| TabBar 외부에 1회 존재 | `grep -c "<TabBar" src/App.jsx` | 1 (line 21에 1회) | ✓ PASS |
| 신규 의존성 import 0건 (D-08) | `grep -E "lucide-react\|framer-motion\|clsx\|tailwind-merge\|class-variance-authority" src/components/TabBar.jsx src/pages/TarotPage.jsx src/App.jsx` | 빈 출력 (0건) | ✓ PASS |
| CSS transition 미사용 (D-10) | `grep -cE "transition\s*:" src/components/TabBar.jsx` | 0 | ✓ PASS |
| 무수정 파일 회귀 가드 (NAV-03) | `git diff 456f637 HEAD --name-only -- src/pages/HomePage.jsx src/pages/SajuPage.jsx src/pages/NewYearPage.jsx src/pages/AmuletPage.jsx src/main.jsx granite.config.ts package.json package-lock.json pnpm-lock.yaml` | 빈 출력 (0행) | ✓ PASS |
| useLocation/useNavigate 사용 | `grep -E "useLocation\|useNavigate" src/components/TabBar.jsx \| wc -l` | 3 (import 1 + 사용 2) | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| NAV-01 | 02-01-PLAN.md | 사용자가 앱 하단 탭바에서 "사주"와 "타로"를 한 번의 탭으로 전환할 수 있다 | ✓ SATISFIED | TabBar.jsx의 TABS 2개 + handleTabClick → useNavigate. App.jsx에 두 라우트 모두 등록. (실제 시각·UX 인지는 human_verification 1·2번) |
| NAV-02 | 02-01-PLAN.md | 탭바에서 현재 활성 탭이 시각적으로 명확히 강조된다 (아이콘·컬러) | ✓ SATISFIED | colors.blue500 + 아이콘 fill (active) vs colors.grey500 + 아이콘 stroke (inactive). (디바이스 시각 대비는 human_verification 3번) |
| NAV-03 | 02-01-PLAN.md | 기존 사주 흐름(`/`, `/saju`, `/new-year`, `/amulet`)이 탭바 도입 후에도 동일하게 동작한다 | ✓ SATISFIED | 기존 4개 페이지·main.jsx·granite.config.ts·package.json/lockfile 모두 0행 변경. App.jsx 5개 기존 라우트 보존. `npm run build` exit 0. (실제 사용자 흐름 회귀 검증은 human_verification 4번) |

**참고 - 라우트 명 표기 차이:** REQUIREMENTS.md(NAV-03)는 `/new-year`로 표기하나 실제 코드는 `/newyear`. PLAN.md/CONTEXT.md/SUMMARY.md/Verification 모두 실제 코드(`/newyear`) 기준을 따름. PROJECT.md 갱신 작업이 phase transition cleanup 항목에 기록되어 있음 (CONTEXT.md `<deferred>` 섹션).

**Orphaned 요구사항:** 없음. REQUIREMENTS.md Traceability 표 기준 Phase 2에 매핑된 NAV-01/02/03 모두 PLAN frontmatter `requirements: [NAV-01, NAV-02, NAV-03]`에 명시됨.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/components/TabBar.jsx` | 84, 63 | Raw hex `'#ffffff'` (TDS 토큰 대신) | ℹ️ Info | 02-REVIEW.md IN-02에 이미 기록됨. nav 배경 + TarotIcon 카드 강조 fill. TDS에 `colors.white` 부재 가능성 → advisory only. 시각·기능 영향 없음. |
| `src/pages/TarotPage.jsx` | 25 | Raw hex `'#666'` (TDS 토큰 대신) | ℹ️ Info | 02-REVIEW.md IN-02에 이미 기록됨. Phase 3에서 placeholder 교체 예정 → advisory only. |
| `src/components/TabBar.jsx` | 15, 132 | `pathname === '/tarot'` 정확 매칭 (하위 경로 미대응) | ⚠️ Warning | 02-REVIEW.md WR-01에 이미 기록됨. Phase 2 한정으로는 D-04(단일 라우트) 정책상 의도된 동작. Phase 3 이후 하위 라우트 도입 시 회귀 가능성. 본 페이즈 영향 없음. |
| `src/pages/TarotPage.jsx` | 8 | `const [currentPage] = useState('intro')` setter 미사용 | ℹ️ Info | 02-REVIEW.md IN-03에 이미 기록됨. **의도된 Phase 3 확장 포인트**. `data-current-page={currentPage}`로 변수는 사용됨 → ESLint 경고 없음. |

**없음:** TODO/FIXME/PLACEHOLDER 주석은 `'타로 준비 중'` placeholder 텍스트(의도된 stub) 외 0건. 비어 있는 핸들러·empty implementation·console.log only 패턴 0건.

**Stub 분류:** TarotPage의 `'타로 준비 중'` 텍스트는 D-01·D-04에서 명시된 의도된 placeholder (Phase 3 책임). 데이터 흐름 stub이 아닌 UI placeholder.

### Human Verification Required

5개 항목이 사용자 실사용 검증을 필요로 합니다 (frontmatter `human_verification` 참조):

1. **`/saju`, `/newyear`, `/amulet`에서 탭바 미노출 시각 확인 (SC4, D-05)**
   - 어떻게: 각 라우트 진입 후 화면 하단에 탭바가 보이지 않는지 확인.
   - 기대: 풀스크린 흐름이 가려지지 않음.
   - 왜 사람이 필요: 코드 단계 `null` 반환은 검증되었으나 시각·실사용 인지는 사용자 영역.

2. **`/`와 `/tarot` 즉시 전환 인지 (NAV-01, SC1)**
   - 어떻게: 탭바에서 사주↔타로 한 번 탭 후 즉각 화면 전환되는지 확인.
   - 기대: transition 없이 즉시 라우트 변경.
   - 왜 사람이 필요: navigate() 호출은 코드 검증 가능하나 즉각성 인지는 시각 영역.

3. **active/inactive 컬러 + 아이콘 fill 대비 (NAV-02, SC2)**
   - 어떻게: 디바이스에서 active/inactive 탭 컬러 대비, 아이콘 fill vs stroke 식별.
   - 기대: 4050 사용자 기준 충분한 시각 대비.
   - 왜 사람이 필요: 코드의 토큰 사용은 검증되었으나 실 디바이스 시각 대비는 디자인 영역.

4. **기존 사주 흐름 v1.0 동작 동일성 확인 (NAV-03, SC3)**
   - 어떻게: HomePage 메뉴 클릭 → 사주/신년운세/부적 흐름 끝까지 진행.
   - 기대: 결과 화면까지 v1.0과 동일.
   - 왜 사람이 필요: 코드 무수정은 git diff로 검증되었으나 실 사용 흐름 회귀는 QA 영역.

5. **iPhone safe-area 가림 여부 확인 (D-06)**
   - 어떻게: 실 iPhone(notch/Dynamic Island) 디바이스에서 탭바와 홈 인디케이터 간 간격 확인.
   - 기대: 홈 인디케이터가 탭 버튼을 가리지 않음.
   - 왜 사람이 필요: CSS 한 줄(`env(safe-area-inset-bottom)`)은 검증되나 디바이스별 시각 가림은 디바이스 테스트 영역.

### Gaps Summary

**Gaps 없음.** 모든 5개 observable truths가 코드 단계에서 VERIFIED. 모든 3개 artifacts가 exists + substantive + wired + data-flowing. 모든 3개 key links가 wired (1건은 gsd-tools false negative, 수동 grep으로 확정). 모든 행위적 spot-checks(빌드 + grep) 통과. NAV-01/02/03 모두 SATISFIED. 신규 의존성 0건, transition 0건, 회귀 가드 0행 변경.

다만 SC1·SC2·SC4는 **시각·실사용 UX 영역**으로 코드만으로 완전히 검증할 수 없으므로 5개 human_verification 항목으로 이관. 이는 작은 UI 페이즈에서 정상적인 검증 경계로, 추가 코드 작업 없이 사용자 QA로 넘기는 단계입니다.

**중요 - 문서 표기 cleanup 작업 (CONTEXT.md `<deferred>` 섹션 기록됨):**
- PROJECT.md `Out of Scope`의 "별도 신규 라우트 추가 (`/tarot` 경로 등)" 항목은 D-01에서 명시적으로 오버라이드되었으므로 phase transition 시점에 갱신 필요.
- REQUIREMENTS.md NAV-03의 `/new-year` 표기는 실제 코드 `/newyear`와 차이 — 이미 PLAN/CONTEXT에서 실제 코드 기준 채택됨.
이는 본 페이즈 산출물 검증 책임 외 cleanup 작업이며 본 verification 결과에 영향 없음.

---

_Verified: 2026-04-30_
_Verifier: Claude (gsd-verifier)_
