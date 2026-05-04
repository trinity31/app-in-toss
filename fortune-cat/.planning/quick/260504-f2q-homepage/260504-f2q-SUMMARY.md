---
phase: quick/260504-f2q-homepage
plan: 01
subsystem: ui-home
tags: [quick, homepage, h1, copy, v1.1]
type: summary
status: complete
requirements:
  - QUICK-260504-F2Q
dependency_graph:
  requires: []
  provides:
    - "HomePage H1 헤더에 결합 정체성(복냥사주&타로) 노출"
  affects:
    - "src/pages/HomePage.jsx (H1 텍스트 노드 단 1줄)"
tech_stack:
  added: []
  patterns:
    - "JSX text node 단순 교체"
key_files:
  created: []
  modified:
    - path: "src/pages/HomePage.jsx"
      change: "H1 텍스트 `복냥사주` → `복냥사주&타로` (라인 233)"
decisions:
  - "스코프 외 다른 `복냥사주` 발생 위치는 변경하지 않음 (사용자 명시 지시 없음, CLAUDE.md 규칙 #2)"
  - "JSX 텍스트 노드 안에서 `&`는 엔티티 변환 없이 그대로 사용 (코드베이스 한글+기호 컨벤션 유지)"
metrics:
  duration_minutes: 1
  completed_date: "2026-05-04"
  tasks_total: 1
  tasks_complete: 1
  files_changed: 1
  lines_changed: 1
---

# Quick 260504-f2q: HomePage H1 헤더에 타로 표기 추가 Summary

**One-liner:** HomePage 최상단 H1 텍스트를 `복냥사주`에서 `복냥사주&타로`로 변경해 v1.1 마일스톤의 결합 정체성을 첫 화면에 반영.

## Objective

토스 공유 링크를 통해 진입한 사용자가 처음 보는 HomePage 헤더가 v1.1 마일스톤의 통합 정체성(사주 + 타로)을 반영하도록, H1 한 줄 텍스트를 갱신.

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | HomePage H1 헤더 텍스트 갱신 (`복냥사주` → `복냥사주&타로`) | done | `bbe5bc4` |

## Changes

### Modified

- **`src/pages/HomePage.jsx`** (line 233)
  - Before: `          복냥사주`
  - After:  `          복냥사주&타로`
  - 들여쓰기, 스타일 객체, `<h1>`/`</h1>` 태그, 형제 노드 모두 보존
  - `git diff` 단일 라인(+1/-1) 변경

## Verification

- `grep -n "복냥사주" src/pages/HomePage.jsx` → 233번 라인에 `복냥사주&타로` 1건만 매칭 (해당 파일 내 다른 라인에는 `복냥사주` 단독 텍스트 없음 확인)
- `git diff src/pages/HomePage.jsx` → 단일 hunk, +1/-1 라인
- 빌드/린트 회귀 위험 없음 — JSX 텍스트 노드의 단순 문자열 교체

## Deviations from Plan

None - plan executed exactly as written.

## Out of Scope (명시적으로 다루지 않음)

본 quick 작업의 스코프는 HomePage.jsx:233 단일 라인 H1 텍스트 변경 한정. 아래 항목은 본 작업에서 다루지 않음:

- 토스 인앱 공유시트의 `displayName` (앱 메타데이터)
- OG 이미지 / 미리보기 카드의 캐시된 타이틀
- HomePage.jsx 내 다른 위치(있다면)의 `복냥사주` 문자열
- 다른 페이지(`SajuPage.jsx`, `TarotPage.jsx`, `AmuletPage.jsx` 등)의 헤더 카피

위 항목은 별도 quick 또는 plan에서 사용자가 명시적으로 지시할 때 처리.

## Self-Check: PASSED

- Modified file exists: `src/pages/HomePage.jsx` — FOUND
- Line 233 contains `복냥사주&타로` — FOUND
- Commit `bbe5bc4` exists in git log — FOUND
- Diff is single line (+1/-1) — VERIFIED
