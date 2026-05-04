---
phase: quick-260504-gbj
plan: 01
subsystem: tarot-result
tags: [tarot, ux, accessibility, modal, uat]
requires:
  - src/components/TarotCardArt.jsx (재사용, 무수정)
  - src/assets/images/cards/getCardImageUrl
provides:
  - TarotResult 하단 fixed 액션 영역 시각 분리감 +12px
  - TarotResult 카드 이미지 확대 모달 (인라인, 신규 의존성 0)
affects:
  - src/components/TarotResult.jsx
tech_stack_added: []
patterns:
  - "인라인 모달 (별도 파일 분리 없이 컴포넌트 내부)"
  - "role=dialog + aria-modal + aria-labelledby SR-only 라벨"
  - "x 버튼 ref + setTimeout 0 포커스 / ESC keydown / body scroll lock useEffect cleanup"
  - "백드롭 클릭 = e.target === e.currentTarget 가드"
key_files:
  created: []
  modified:
    - src/components/TarotResult.jsx
decisions:
  - "fade-in 200ms keyframe 미적용 — 인라인 style 컨벤션 유지 (PLAN Task B 결정 6 그대로 채택)"
  - "트리거를 perspective wrapper(외곽)에 부착 — flip transform 충돌 회피"
  - "TarotCardArt 무수정 — 모달 내에서도 size=lg framed 그대로 재사용 (UAT 범위 밖 컴포넌트 보호)"
metrics:
  duration: ~5분
  tasks_completed: 2/2
  commits: 2
  files_modified: 1
  completed_date: 2026-05-04
requirements:
  - UAT-260504-GBJ-01
  - UAT-260504-GBJ-02
---

# Quick Task 260504-gbj: TarotResult UAT 피드백 2건 Summary

**One-liner:** TarotResult 하단 fixed 영역 8→20px 여백 + 카드 이미지 클릭 시 인라인 확대 모달 추가 (백드롭/x버튼/ESC 3종 닫기, role=dialog 접근성).

## Context

UAT 피드백 2건을 한 plan, 두 개의 atomic commit 으로 처리:
1. (UAT-260504-GBJ-01) 보라색 공유하기 버튼 그림자가 탭바 윗선과 거의 닿아 시각 분리감 부족 → 8px → 20px
2. (UAT-260504-GBJ-02) 결과 카드 이미지를 더 크게 보고 싶다 → 클릭 시 모달 확대

## Tasks Completed

### Task A — 하단 fixed 버튼 영역 여백 8px → 20px

- **Commit:** `515c746`
- **Files:** `src/components/TarotResult.jsx` (1 line, +1/-1)
- **Change:** `bottom: 'calc(72px + env(safe-area-inset-bottom) + 8px)'` → `... + 20px)'`
- **Verification:**
  - grep "calc(72px + env(safe-area-inset-bottom) + 20px)" → 1 hit (line 199 post-edit)
  - grep "calc(72px + env(safe-area-inset-bottom) + 8px)" → 0 hits

### Task B — 카드 이미지 확대 모달 (인라인)

- **Commit:** `bf0d645`
- **Files:** `src/components/TarotResult.jsx` (+113 / -2)
- **Implementation summary:**
  - import 보강: `useRef` 추가
  - state: `isZoomed` (boolean), `closeButtonRef` (ref)
  - 트리거: perspective wrapper 외곽에 `role="button"` + `tabIndex={0}` + `aria-label="카드 확대 보기"` + `onClick` + `onKeyDown(Enter/Space)` + `cursor: pointer`
  - useEffect (deps: `[isZoomed]`):
    - ESC keydown 리스너 등록
    - body scroll lock (prev overflow 백업 → cleanup 시 복원)
    - x 버튼에 setTimeout 0 으로 focus
    - cleanup: keydown 제거 + overflow 복원 + clearTimeout
  - 모달 JSX: `role="dialog"` `aria-modal="true"` `aria-labelledby="tarot-zoom-title"`, 백드롭 클릭(`e.target===e.currentTarget`)으로 닫힘, x 버튼 44x44 hit area, SR-only h2 (clip rect), TarotCardArt 재사용 (size=lg framed)
- **Verification:**
  - 모든 grep 검증 5종 통과 (state / aria / labels / ESC+scroll / ref)
  - `npm run lint` → TarotResult.jsx 관련 신규 에러/경고 0 (기존 baseline 14E/13W 유지, 본 작업 무관)
  - `npm run build` → 통과 (vite + AIT 산출물 생성, deploymentId 발급)

## Verification

| Check | Result |
|---|---|
| Task A grep (+20px present, +8px absent) | PASS |
| Task B grep (state/aria/labels/ESC/ref) | PASS (5/5) |
| ESLint baseline 유지 (TarotResult.jsx 신규 0) | PASS |
| `npm run build` (vite + AIT) | PASS |
| atomic commit 2개 (fix:, feat:) | PASS (`515c746`, `bf0d645`) |
| TarotCardArt.jsx 무수정 | PASS |
| 처음으로/공유하기/카드 chip/message/자동 플립 무수정 | PASS |
| 신규 npm 의존성 0 (D-02 carry) | PASS |

## Manual UAT (사용자가 직접 확인)

1. `/tarot` → 카드 뽑기 → 결과 진입
2. 화면 하단 보라색 공유하기 버튼 그림자가 탭바 윗선과 명확히 분리되어 보임
3. 결과 카드 이미지 탭 → 큰 카드 모달 노출
4. 우상단 ✕ 버튼 탭 → 모달 닫힘
5. 모달 다시 열기 → 검은 배경(백드롭) 탭 → 모달 닫힘
6. (개발 환경) 모달 다시 열기 → ESC → 모달 닫힘
7. 처음으로 / 공유하기 정상 동작 (회귀 없음)
8. 카드 자동 플립(0.9s rotateY) 정상 동작 (회귀 없음)

## Deviations from Plan

None — plan executed exactly as written. 모든 결정(특히 fade-in 200ms keyframe 생략, 트리거를 perspective wrapper 에 두는 위치)은 PLAN Task B 의 가이드를 그대로 따랐습니다.

## Auth Gates

해당 없음.

## Known Stubs

없음. 모달 내 노출되는 카드 이미지는 실제 `getCardImageUrl(card.id)` 결과를 사용 (스텁 아님).

## Threat Flags

없음. 새 네트워크 엔드포인트, 인증 경로, 파일 접근, 스키마 변경 없음. 모달은 클라이언트 only DOM 추가.

## Commits

| # | Hash | Type | Description |
|---|------|------|-------------|
| 1 | `515c746` | fix(quick-260504-gbj) | TarotResult 하단 버튼 여백 8px → 20px |
| 2 | `bf0d645` | feat(quick-260504-gbj) | TarotResult 카드 이미지 확대 모달 추가 |

## Self-Check: PASSED

- File `src/components/TarotResult.jsx` exists — FOUND
- Commit `515c746` exists — FOUND (`fix(quick-260504-gbj): TarotResult 하단 버튼 여백 8px → 20px`)
- Commit `bf0d645` exists — FOUND (`feat(quick-260504-gbj): TarotResult 카드 이미지 확대 모달 추가`)
- npm run build — PASS (AIT artifact created)
- npm run lint — TarotResult.jsx 신규 issue 0
