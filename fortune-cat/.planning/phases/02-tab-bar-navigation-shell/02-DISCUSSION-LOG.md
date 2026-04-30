# Phase 2: 하단 탭바 네비게이션 셸 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-01
**Phase:** 02-tab-bar-navigation-shell
**Areas discussed:** 라우팅 통합 방식, 탭바 노출 정책, 탭 시각화 디자인, 탭 전환 애니메이션

---

## 라우팅 통합 방식

### 사주 탭과 타로 탭은 각각 어떤 라우트와 매핑되어야 할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| /tarot 라우트 추가 (Recommended) | 사주 탭 = /, 타로 탭 = /tarot. URL 명확. PROJECT.md "별도 /tarot 라우트 금지" 제약과 충돌. | ✓ |
| 쿼리 파라미터 (/?tab=tarot) | 라우트 추가 없음, URL이 어색하고 history 동작 까다로움. | |
| HomePage 내부 분기 (라우트 추가 없음) | 둘 다 / 라우트, useState로 화면 전환. PROJECT 제약 준수, but URL로 타로 구분 불가. | |

**User's choice:** /tarot 라우트 추가 (Recommended)

**Conflict flag:** 답변 후 PROJECT.md `Out of Scope` ("별도 /tarot 라우트 금지") + Phase 1 D-10 ("PROJECT.md '별도 /tarot 라우트 추가 금지' 제약과 부합")과 충돌 발견 → 사용자 재확인 필요.

### 라우팅 매핑을 어떻게 잠그시겠어요? (충돌 해결)

| Option | Description | Selected |
|--------|-------------|----------|
| /tarot 라우트 추가 — prior decision 뒤집기 | PROJECT.md Out of Scope 항목 제거 + Phase 1 D-10 재해석. URL 명확성 우선. | ✓ |
| Phase 1 D-10 유지 — 공유 라우트(/) 안에서 탭으로 구분 | PROJECT 제약 완벽 준수, but URL로 타로 구분/딥링크 불가. | |

**User's choice:** /tarot 라우트 추가 — prior decision 뒤집기

**Notes:** Phase 2 CONTEXT.md D-01에 명시적 prior decision override로 기록. PROJECT.md `Out of Scope` 갱신은 Phase 2 종료 시 cleanup 작업으로 deferred 섹션에 등재.

### 탭바는 어느 컴포넌트 레벨에서 렌더링되어야 할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| App.jsx (라우트 outer shell, Recommended) | <Routes> 바깥에 탭바 배치, 라우트 전환 시 unmount 안 됨, 상태 유지. | ✓ |
| 각 페이지 컴포넌트 내부 | HomePage·TarotPage 등에서 각자 렌더링. 노출 제어 쉬우나 페이지마다 중복 코드. | |
| 별도 Layout 컴포넌트 | TabBarLayout으로 <Routes> 감싸고 children outlet. React Router 7 nested routes 패턴. | |

**User's choice:** App.jsx (라우트 outer shell, Recommended)

### 사용자가 사주/타로 탭을 누르면 각 탭의 어떤 화면으로 진입해야 할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 사주 = HomePage 처음 화면 / 타로 = TarotPage 처음 화면 (Recommended) | 탭 누를 때마다 reset. v1.0 사용자에게 익숙·단순. | ✓ |
| 각 탭의 '마지막 본 위치'로 복귀 | history 기반 복귀. 구현 복잡도 높고 4050 멘탈 모델과 거리. | |
| 사주 = HomePage / 타로 = 항상 TarotPage intro | 동일하게 reset (데일리 원카드는 하루 1회 흐름이라 단순). | |

**User's choice:** 사주 = HomePage 처음 화면 / 타로 = TarotPage 처음 화면 (Recommended)

---

## 탭바 노출 정책

### 탭바는 어떤 레벨에서 노출/숨김을 결정해야 할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 라우트별 숨김 (Recommended) | / 와 /tarot에서만 표시, 나머지 숨김. App.jsx에서 useLocation()으로 단순 판정. | ✓ |
| 라우트별 + 타로 내 currentPage별 숨김 | 라우트별 + TarotPage shuffle/result 단계에서도 숨김. 추가 복잡도. | |
| 각 페이지 컴포넌트에서 hidden prop 전달 | 페이지가 hidden boolean 조작. prop drilling 발생. | |

**User's choice:** 라우트별 숨김 (Recommended)

### /saju · /newyear · /amulet 라우트에서는 탭바를 완전히 숨긴다. 맞나요?

| Option | Description | Selected |
|--------|-------------|----------|
| 네, 완전히 숨김 (Recommended) | 풀스크린 흐름(결제·딥리딩·사진·로딩) 보호. NAV-03/SC4 충족. | ✓ |
| /saju·/newyear는 숨김, /amulet만 숨김 | 부분적 숨김. 구현·테스트 범위 넓어짐. | |
| 모든 라우트에서 항상 표시 | SC4 위반 위험. | |

**User's choice:** 네, 완전히 숨김 (Recommended)

### 탭바 높이·safe-area 처리는 어떻게 가져갈까요?

| Option | Description | Selected |
|--------|-------------|----------|
| TDS 기본 패턴 채택 (Recommended) | TDS Mobile이 제공하는 safe-area-inset-bottom 처리·높이 토큰 그대로 사용. | ✓ |
| 자체 높이 지정 (예: 64dp + safe-area-inset-bottom) | Emotion css로 직접. 토큰 부일치 시 좋으나 TDS 버전업 시 드리프트. | |
| Phase 3에서 실측·디자인 검토 후 결정 | Phase 2는 기계적 구현만, 높이·패딩은 Phase 3 디자인 리뷰 후 확정. | |

**User's choice:** TDS 기본 패턴 채택 (Recommended)

---

## 탭 시각화 디자인

### 탭바를 구성하는 핵심 UI 컴포넌트는 무엇을 씁니까?

| Option | Description | Selected |
|--------|-------------|----------|
| TDS Mobile TabBar/BottomNav 컴포넌트 (Recommended) | @toss/tds-mobile 제공 컴포넌트 우선. 토스인앱 일관성·접근성 자동. | ✓ |
| Emotion + 기본 HTML로 자체 제작 | TDS에 적합한 컴포넌트 없을 때. nav + ul + li 구조에 Emotion css. | |
| Phase 2 시작 시 TDS 카탈로그 확인 후 결정 | node_modules 식별 후 1번/2번 결정. (Claude's Discretion에 위임) | |

**User's choice:** TDS Mobile TabBar/BottomNav 컴포넌트 (Recommended)

**Notes:** D-07에서 "TDS 카탈로그 확인 후 부재 시 Emotion 폴백"을 명시 — 사실상 우선 1번 + 폴백 2번 형태로 캡처.

### 탭 아이콘은 어떻게 처리할까요? (lucide-react 미도입 D-08)

| Option | Description | Selected |
|--------|-------------|----------|
| TDS 아이콘 세트 (Recommended) | @toss/tds-mobile 아이콘 컴포넌트에서 사주/타로 적합 2개 선택. 일관성 최대. | ✓ |
| 이모티콘(보라색 구슬/원형 등) 직접 그리기 | Emotion css로 SVG path 직접 정의. 자유도 높으나 제작 시간. | |
| 이모지 (🔮 사주 / 🃏 타로) | 4050 친숙·구현 쉬움. 장치별 렌더링 우려. | |

**User's choice:** TDS 아이콘 세트 (Recommended)

### active 탭은 어떻게 강조해야 할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 컬러 + 아이콘 fill (Recommended) | active = 브랜드 컬러·fill, inactive = grey·stroke only. 일반 토스 패턴. | ✓ |
| 컬러만 교체 (아이콘 fill 동일) | 아이콘 모양 그대로, 컬러만 active=브랜드 컬러. | |
| 컬러 + 레이블 굵은 글꼴 | 컬러 + 굵은 weight로 강조. 4050 텍스트 대비 이점. | |

**User's choice:** 컬러 + 아이콘 fill (Recommended)

---

## 탭 전환 애니메이션

### 탭 전환 애니메이션은 어떻게 가져갈까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 즉시 전환 (트랜지션 없음, Recommended) | 클릭 시 즉시 라우트 변경. v1.0 단순성·4050 명료성. framer-motion 면제. | ✓ |
| TDS 기본 트랜지션 (페이드/슬라이드) | TDS 제공 기본 페이지 트랜지션 사용. | |
| active 탭의 아이콘/컬러만 CSS transition | 라우트 즉시, active 표시만 부드럽게. CSS만으로 가능. | |
| Phase 3에서 결정 보류 (D-09와 묶기) | Phase 2는 애니메이션 없이 구현, 모션은 Phase 3 한꺼번에. | |

**User's choice:** 즉시 전환 (트랜지션 없음, Recommended)

### Phase 2에서 framer-motion 도입을 결정해야 할 필요가 있을까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 아니오, Phase 3으로 미루기 (Recommended) | 탭바 자체에는 모션 불필요. 카드 뒤집기·셔플 구현 시점에 한꺼번에 결정 (D-09 보류). | ✓ |
| 네, Phase 2에서 도입 | Phase 2에서도 framer-motion 추가. AIT 심사·번들 크기 영향 미리 검증. | |

**User's choice:** 아니오, Phase 3으로 미루기 (Recommended)

---

## Claude's Discretion

다음 항목은 사용자가 결정을 Claude에게 위임 또는 Phase 2 실행 시점에 자연스럽게 결정되도록 둠:

- 탭바 컴포넌트의 정확한 명칭·import path (TDS 카탈로그 grep 결과)
- 사주/타로 탭의 정확한 TDS 아이콘 선택
- active 컬러의 정확한 토큰값
- `TarotPage.jsx` 빈 컨테이너의 placeholder 콘텐츠
- active 탭을 다시 눌렀을 때 동작 (reset vs 무시)

---

## Deferred Ideas

본 페이즈 외에서 다룰 항목 (CONTEXT.md `<deferred>` 섹션 참조):

- 데일리 원카드 코어 UI (Phase 3)
- framer-motion 도입 여부 (Phase 3)
- 탭 전환 페이지 트랜지션 (추후 사용자 피드백 기반)
- 탭 3개+ 확장·알림 배지·길게 누르기 컨텍스트 메뉴 (다음 마일스톤)
- PROJECT.md `Out of Scope`/`Key Decisions` 갱신 (Phase 2 종료 시 cleanup)

---

*Phase: 02-tab-bar-navigation-shell*
*Discussion log written: 2026-05-01*
