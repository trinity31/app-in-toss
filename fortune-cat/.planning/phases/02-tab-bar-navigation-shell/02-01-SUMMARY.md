---
phase: 02-tab-bar-navigation-shell
plan: 01
subsystem: navigation-shell
tags: [tab-bar, routing, react-router-dom, tds-mobile, emotion-fallback, ui-shell]
requires:
  - "src/App.jsx (5개 기존 라우트 정의)"
  - "src/main.jsx (Provider 체인 — 무수정)"
  - "@toss/tds-colors (colors.blue500/grey500/grey200 토큰)"
  - "react-router-dom 7.9.5 (useLocation/useNavigate)"
provides:
  - "src/components/TabBar.jsx — 사주/타로 두 탭, 라우트별 숨김, active fill 강조"
  - "src/pages/TarotPage.jsx — /tarot 빈 컨테이너 (Phase 3 currentPage 확장 포인트)"
  - "src/App.jsx — /tarot 라우트 + TabBar outer shell 통합"
affects:
  - "사용자: HomePage(/)/TarotPage(/tarot)에서 하단 탭바를 본다"
  - "사용자: /saju·/newyear·/amulet 풀스크린 흐름은 v1.0과 동일 (탭바 숨김)"
  - "AIT 빌드 산출물: fortune-cat.ait 호환 유지 (granite.config.ts 무수정)"
tech-stack:
  added: []  # 신규 npm 의존성 0개
  patterns:
    - "라우트별 숨김: VISIBLE_PATHS Set + useLocation 단순 매칭 (D-05)"
    - "active = 컬러 토큰 + SVG fill, inactive = grey + stroke (D-09)"
    - "outer shell: <Routes>와 <TabBar />를 형제로 (D-02)"
    - "currentPage 상태 머신 진입점만 마련 후 Phase 3에서 확장 (D-04)"
key-files:
  created:
    - "src/components/TabBar.jsx"
    - "src/pages/TarotPage.jsx"
  modified:
    - "src/App.jsx (Navigate import 제거, TarotPage/TabBar import 추가, /tarot 라우트 추가, Fragment + TabBar 형제 배치)"
decisions:
  - "D-07 분기: TDS Tab은 상단 세그먼트 탭이라 하단 탭바 부적합 → inline style 폴백 채택"
  - "기존 코드베이스가 css prop을 쓰지 않아 Emotion css 대신 React inline style로 구현 (DRY/일관성)"
  - "active 컬러: colors.blue500 / inactive: colors.grey500 / 분리선: colors.grey200"
  - "사주 아이콘: 5각 별 SVG path / 타로 아이콘: 카드(rect)+다이아몬드(path) SVG"
metrics:
  tasks_completed: 3
  commits: 3
  duration: "~10분 (실행자 wall-clock 추정)"
  completed: "2026-04-30"
---

# Phase 2 Plan 01: 하단 탭바 네비게이션 셸 Summary

**One-liner:** React Router DOM `useLocation`/`useNavigate` 기반 사주/타로 2탭 하단 셸을 inline-style 폴백으로 도입하고 `/tarot` 빈 라우트와 outer-shell 통합을 완료했다.

## What Shipped

| 산출물 | 경로 | 역할 |
|---|---|---|
| TabBar 컴포넌트 (신규) | `src/components/TabBar.jsx` | 사주(`/`) · 타로(`/tarot`) 두 탭 셸. 라우트별 표시 판정 + active fill 강조. |
| TarotPage 컨테이너 (신규) | `src/pages/TarotPage.jsx` | `/tarot` 라우트의 빈 컨테이너. Phase 3 `currentPage` 상태 머신(`intro`→`shuffle`→`result`) 확장 포인트. |
| App 라우터 통합 (수정) | `src/App.jsx` | `/tarot` 라우트 추가 + `<TabBar />`를 `<Routes>` 바깥 형제로 배치. 사용하지 않던 `Navigate` import 정리. |

## TDS 카탈로그 grep 결과 (D-07 분기 결정)

### 검색

```bash
grep -E "^export declare (const|function) (Tab|BottomNav|TabBar|TabNavigation|BottomTab)" \
  node_modules/@toss/tds-mobile/dist/esm/index.d.ts
# → 결과: `export declare function Tab({ fluid, ...props }: TabProps): JSX_2.Element;`
#         `export declare const TableRow: ...` (관련 없음)

grep -E "^export declare (const|function) (Tab|BottomNav|TabBar|TabNavigation|BottomTab)" \
  node_modules/@toss/tds-mobile-ait/dist/esm/index.d.ts
# → 결과 없음 (Mobile-AIT는 SafeAreaInsets · TDSMobileAITProvider 만 export)
```

### 분기 결정

- **TDS `Tab` + `Tab.Item` 구조 분석:**
  - `Tab` JSDoc: "사이즈에 따라 `Tab`의 높이와 텍스트 크기가 변경돼요" (`size: 'large' | 'small'`)
  - `Tab.Item`: `{ selected, redBean?, focused?, onSelectItem?, onResize? }` — 인디케이터 기반 상단 세그먼트 탭 시그니처
  - 시각: 가로 스크롤 가능한 세그먼트 형태 (예: 콘텐츠 섹션 필터). **하단 fixed 탭바 의미·시각과 부적합.**
- **케이스 B 채택 (Emotion 폴백 → 구현 시 inline style로 추가 일반화):** TDS Tab을 하단 탭바로 wrapper만으로 만들 경우 D-09(아이콘 fill 대비)·D-06(safe-area + 하단 fixed) 정책을 강제할 수 없어 재사용성보다 정책 강제가 더 중요. 기존 코드베이스가 `@emotion/react`의 `css` prop을 어떤 컴포넌트도 쓰지 않고 inline `style={{...}}` 패턴(`HomePage.jsx`, `SajuPage.jsx` 등)에 일관되어 있어 **DRY 원칙상 Emotion css 대신 inline style로 폴백 구현**.
- TDS 아이콘 export: `@toss/tds-mobile` index.d.ts에서 `IconButton` 외 일반 아이콘 컴포넌트 export 0개 확인. 따라서 D-08의 "TDS 세트 한정" 단서를 만족 불가 → SVG path 자체 정의 폴백.

## 시각 결정 (D-09)

| 상태 | 컬러 토큰 | 아이콘 | 적용 |
|---|---|---|---|
| active | `colors.blue500` | filled (`fill={ACTIVE_COLOR}`) | 텍스트 색상 + SVG fill |
| inactive | `colors.grey500` | outlined (`fill="none"` + `stroke={INACTIVE_COLOR}`) | 텍스트 색상 + SVG stroke |
| 분리선 | `colors.grey200` | — | nav `border-top: 1px solid` |

레이블 폰트 굵기는 active/inactive 동일(`fontWeight: 500`) — **컬러로만 구분**(D-09).

## 아이콘 출처 (D-08)

| 탭 | 아이콘 | path 출처 |
|---|---|---|
| 사주 | 5각 별 (점성술 의미) | 자체 정의 SVG path (`d="M12 2.5l2.76 6.18 ..."`) |
| 타로 | 카드(rect rx=2) + 중앙 마름모 | 자체 정의 SVG `<rect>` + path |

`lucide-react` 등 아이콘 라이브러리 0회 import.

## 빌드 검증 (NAV-03)

```bash
cd fortune-cat
npm run build  # = ait build
# vite v5.4.21 building for production...
# ✓ 656 modules transformed.
# ✓ built in 7.83s
# AIT build completed (fortune-cat.ait)
# EXIT=0
```

산출물:
- `dist/index.html` (0.76 kB)
- `dist/assets/index-*.js` (1,589 kB / gzip 476 kB)
- `dist/bundle.android.*.js` + `bundle.ios.*.js` (RN 0.84.0 + 0.72.6 양쪽 호환)
- `fortune-cat.ait` (7.1 MB)

## 회귀 가드 검증 (T-02-01/02/03 mitigations)

```bash
git diff --name-only --base 456f637 -- \
  fortune-cat/src/pages/HomePage.jsx \
  fortune-cat/src/pages/SajuPage.jsx \
  fortune-cat/src/pages/NewYearPage.jsx \
  fortune-cat/src/pages/AmuletPage.jsx \
  fortune-cat/src/main.jsx \
  fortune-cat/granite.config.ts \
  fortune-cat/package.json \
  fortune-cat/package-lock.json \
  fortune-cat/pnpm-lock.yaml
# → 0행 (전부 무수정)
```

| 가드 항목 | 결과 |
|---|---|
| HomePage.jsx 무수정 | ✓ |
| SajuPage.jsx 무수정 | ✓ |
| NewYearPage.jsx 무수정 | ✓ |
| AmuletPage.jsx 무수정 | ✓ |
| main.jsx Provider 체인 무수정 | ✓ |
| granite.config.ts 무수정 (T-02-03) | ✓ |
| package.json·lockfile 무수정 (T-02-02) | ✓ |
| 기존 5개 라우트 정의 보존 (T-02-01) | ✓ |

## Acceptance Criteria 결과

### Task 1 (TabBar.jsx)
- [x] 파일 존재 + default export
- [x] `'사주'` · `'타로'` 레이블, `'/'` · `'/tarot'` to
- [x] `useLocation` + `useNavigate` 둘 다 import (count=3)
- [x] `VISIBLE_PATHS`로 `/saju`·`/newyear`·`/amulet`에서 `null` 반환
- [x] `lucide-react`/`framer-motion`/`clsx`/`tailwind-merge`/`class-variance-authority` import 0회
- [x] CSS `transition:` 속성 0회
- [x] D-07 분기 결정 주석 파일 상단 1행
- [x] `package.json`/lockfile 무수정

### Task 2 (TarotPage.jsx)
- [x] 파일 존재 + default export
- [x] `currentPage` 상태 변수 선언 (Phase 3 확장 포인트)
- [x] Phase 3 마커 주석(`Phase 3` + `intro`/`shuffle`/`result`)
- [x] 신규 의존성 import 0개

### Task 3 (App.jsx 수정)
- [x] `/tarot` 라우트 등록 (catch-all 위)
- [x] `TarotPage` + `TabBar` import
- [x] `<TabBar />`가 `<Routes>` **바깥**(awk grep count=0)
- [x] 기존 5개 라우트 정의 보존
- [x] `npm run build` exit 0
- [x] 페이지 컴포넌트 4개·main.jsx·granite.config.ts·package.json·lockfile 모두 무수정

## Success Criteria 매핑

| SC | 출처 | 본 플랜 충족 근거 |
|---|---|---|
| SC1 (NAV-01) | TabBar 한 번 탭으로 라우트 전환 | TabBar `handleTabClick` → `navigate(to)`, App.jsx에 `/`·`/tarot` 모두 등록 |
| SC2 (NAV-02) | active 시각 강조 | `ACTIVE_COLOR` + 아이콘 `fill` vs inactive `stroke` |
| SC3 (NAV-03) | 기존 흐름 회귀 없음 | 페이지 4개·main.jsx·granite.config.ts·package.json/lockfile 무수정 + `ait build` 성공 |
| SC4 | 풀스크린 흐름 가리지 않기 | `VISIBLE_PATHS = {'/', '/tarot'}` — `/saju`·`/newyear`·`/amulet`에서 `null` |

## Phase 3 확장 포인트

- **`src/pages/TarotPage.jsx` line 7:** `const [currentPage] = useState('intro')` — Phase 3에서 setter 노출 + `if (currentPage === 'shuffle') ... else if (currentPage === 'result') ...` 분기 추가.
- **하단 padding 96px:** TabBar 높이(56) + safe-area buffer. Phase 3 카드 영역이 더 길어지면 컨테이너 padding 재조정 가능.
- **D-10 보류 항목:** `framer-motion` 도입은 Phase 3 카드 뒤집기 구현 시점에 결정 예정.

## Deviations from Plan

**플랜 가이드라인 대비 1건의 자동 적용 결정:**

**[Rule 3 - 코드베이스 일관성] Emotion `css` prop → React inline style 전환**
- **Found during:** Task 1 시작 시점
- **이유:** Plan은 케이스 B에서 "Emotion + 기본 HTML"을 권고했으나 실제 코드베이스 grep 결과 `@emotion/react`의 `css` prop을 사용하는 컴포넌트가 0개였고 vite 설정에 `@emotion/babel-plugin`이나 `jsxImportSource` 설정도 없음. 그 상태로 `css={...}` prop을 쓰면 런타임에서 무시되어 스타일 미적용.
- **결정:** 기존 코드베이스 패턴(inline `style={{...}}` — `HomePage.jsx`, `SajuPage.jsx` 등)에 맞춰 inline style 객체 + 외부 헬퍼 0개로 구현. `@emotion/react` import도 제거.
- **영향:** Plan acceptance(forbidden import 0개·transition 0개·D-09 시각·D-05 라우트 숨김) 모두 그대로 충족. DRY/코드 일관성 개선.
- **Files modified:** `src/components/TabBar.jsx` (한 파일 내부 결정, 다른 파일 영향 없음)
- **Commit:** `69a85a0`

다른 deviation 없음.

## Auth Gates

해당 없음 (UI 셸 전용, 외부 인증 호출 0).

## Threat Flags

본 플랜이 새로 도입한 보안 surface 없음.
- TabBar는 클라이언트 라우팅 트리거만 (외부 입력 없음).
- TarotPage는 빈 placeholder (네트워크·스토리지·인증 호출 없음).
- App.jsx 변경은 라우트 1개 추가 + JSX 형제 배치만.

플랜 `<threat_model>`의 T-02-01/02/03 mitigations 모두 acceptance 통과.

## Known Stubs

- `TarotPage`의 `'타로 준비 중'` placeholder 텍스트 — Phase 3 `intro` 화면으로 교체 예정. **의도된 stub** (D-01·D-04 명시).

## Commits

| Task | Commit | 메시지 |
|---|---|---|
| 1 | `69a85a0` | feat(02-01): add TabBar with route-based visibility (NAV-01/02) |
| 2 | `a065590` | feat(02-01): add TarotPage placeholder for /tarot route (D-04) |
| 3 | `8165eba` | feat(02-01): integrate /tarot route + TabBar shell into App (NAV-03) |

## Self-Check: PASSED

- `src/components/TabBar.jsx` ✓ FOUND
- `src/pages/TarotPage.jsx` ✓ FOUND
- `src/App.jsx` 수정 ✓ FOUND
- 커밋 `69a85a0` ✓ FOUND
- 커밋 `a065590` ✓ FOUND
- 커밋 `8165eba` ✓ FOUND
- `npm run build` ✓ exit 0 (`fortune-cat.ait` 7.1 MB 생성)
