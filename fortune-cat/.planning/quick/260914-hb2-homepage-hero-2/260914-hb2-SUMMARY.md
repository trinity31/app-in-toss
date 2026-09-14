---
phase: quick-260914-hb2
plan: 01
subsystem: ui
tags: [react, home, carousel, analytics, navigation]
status: complete

requires: []
provides:
  - "홈 Hero 영역을 애정운·궁합 연애상담 바로가기 2슬라이드 캐러셀로 교체"
  - "src/components/HomeHeroCarousel.jsx 프레젠테이션 컴포넌트"
  - "COMPATIBILITY_SELECTED_TYPE / LOVE_SELECTED_TYPE 단일 상수 + goToNewYear 공용 네비게이트 헬퍼"
affects: [home, navigation, analytics]

tech-stack:
  added: []
  patterns:
    - "프레젠테이션/컨테이너 분리: HomeHeroCarousel(순수 UI) + HomePage(데이터·네비게이션 소유)"
    - "공용 selectedType 상수를 퀵메뉴·Hero 배너·handleNewYearTypeClick 이 goToNewYear 한 헬퍼로 공유(DRY)"

key-files:
  created:
    - src/components/HomeHeroCarousel.jsx
  modified:
    - src/pages/HomePage.jsx

key-decisions:
  - "웹앱 home.tsx의 Hero() 로직(스크롤스냅, 자동재생 4500ms, pointer/touch/focus 일시정지, prefers-reduced-motion, 점 인디케이터)을 Tailwind 없이 inline style + 모듈 상수로 1:1 포팅"
  - "궁합 selectedType 을 COMPATIBILITY_SELECTED_TYPE 단일 상수로 승격해 기존 퀵메뉴와 Hero 배너가 완전히 동일한 값을 공유하도록 함(navigate state 불일치 방지)"

requirements-completed: [QUICK-260914-hb2]

duration: 25min
completed: 2026-09-14
---

# Quick Task 260914-hb2: 홈 Hero 배너 애정운·궁합 슬라이드 교체 Summary

**토스 미니앱 홈 최상단 Hero(배경이미지+문구)를 애정운/궁합 연애상담 바로가기 2장짜리 스크롤스냅 캐러셀로 교체, 웹앱 home.tsx 구현을 미니앱 관용구로 포팅.**

## Performance

- **Duration:** ~25 min
- **Tasks:** 2/2 completed
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments

- `HomeHeroCarousel.jsx` 신규 프레젠테이션 컴포넌트: 스크롤스냅 캐러셀, 4500ms 자동재생(포인터/터치/포커스 시 정지, `prefers-reduced-motion` 존중), 점 인디케이터, 공유 버튼, 시각적으로 숨겨진 `<h1>` 포함
- `HomePage.jsx`: 기존 배경이미지 Hero 블록을 `<HomeHeroCarousel>` 렌더로 교체, `heroBackground` import 제거(에셋 파일 자체는 유지)
- `COMPATIBILITY_SELECTED_TYPE`/`LOVE_SELECTED_TYPE` 상수 + `goToNewYear` 헬퍼로 궁합풀이 퀵메뉴·Hero 배너·`handleNewYearTypeClick`의 `/newyear` 이동 로직을 단일화(DRY)
- 배너 탭 시 `trackClick("hero_banner_click", { menu: slide.selectedType.fortuneType }, slide.eyebrow)` 발생

## Task Commits

Both tasks were implemented together and committed as a single commit per plan Task 2 instructions (Task 1 produced the new component file, verified independently, then committed together with Task 2's HomePage changes):

1. **Task 1+2: HomeHeroCarousel 생성 + HomePage 연결/교체** - `199f00e` (feat)

## Files Created/Modified

- `src/components/HomeHeroCarousel.jsx` - 신규. props `{ slides, onSlideClick, onShare }`, 스크롤스냅 캐러셀 + 자동재생 + 점 인디케이터 + 공유 버튼
- `src/pages/HomePage.jsx` - `heroBackground` import 제거, `HomeHeroCarousel` import 추가, `COMPATIBILITY_SELECTED_TYPE`/`LOVE_SELECTED_TYPE`/`HERO_SLIDES` 상수 추가, `goToNewYear` 헬퍼 추가, 퀵메뉴 궁합풀이·`handleNewYearTypeClick`을 `goToNewYear` 경유로 통일, `handleHeroSlideClick` 추가, 기존 Hero JSX 블록을 `<HomeHeroCarousel>` 렌더로 교체

## Decisions Made

- Task 1과 Task 2를 각각 개별 커밋하지 않고 계획서 Task 2의 커밋 지시(정확히 두 파일만 포함)에 맞춰 하나의 커밋으로 묶음 — Task 1도 별도 커밋할 경우 "두 파일만 포함된 커밋 1개" done 조건과 충돌 우려가 있어 계획서 문구("Output: ... 커밋 1개")를 따름

## Deviations from Plan

None - plan executed exactly as written. (계획서가 명시한 "커밋 1개" 산출물에 맞춰 Task 1 산출물도 최종 커밋에 포함시킨 것 외에는 계획과 완전히 동일하게 구현)

## Verification Results

- `npx eslint src/components/HomeHeroCarousel.jsx` — 0 errors, 0 warnings
- `npx eslint src/pages/HomePage.jsx src/components/HomeHeroCarousel.jsx` — 0 errors, 1 pre-existing warning (`react-hooks/exhaustive-deps` on `useEffect(() => { fetchAllTypes(); }, [])` at line ~173, unrelated to this task's changes — existed before this plan)
- `npx vite build` — 성공 (BUILD_OK)
- `git diff --cached --name-only` 직전 확인 결과 정확히 `fortune-cat/src/pages/HomePage.jsx`, `fortune-cat/src/components/HomeHeroCarousel.jsx` 두 파일만 포함
- `git diff --diff-filter=D --name-only HEAD~1 HEAD` — 삭제된 파일 없음 (hero.png 에셋 파일은 그대로 유지, import만 제거)
- "무제한" 문자열 0회 (HomeHeroCarousel.jsx 기준), 기존 L424 "운세 보고 질문도 무제한으로 하기" 문구는 미변경

## Known Stubs

None.

## Threat Flags

None — 신규 네트워크 엔드포인트·인증 경로·파일 접근·스키마 변경 없음. 기존 `/newyear` 라우터 state 전달 경로만 재사용.

## Self-Check: PASSED

- FOUND: /Users/trinity/Projects/app-in-toss/fortune-cat/src/components/HomeHeroCarousel.jsx
- FOUND: /Users/trinity/Projects/app-in-toss/fortune-cat/src/pages/HomePage.jsx
- FOUND commit: 199f00e
