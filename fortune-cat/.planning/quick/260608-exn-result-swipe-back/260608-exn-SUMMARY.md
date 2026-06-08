---
quick_id: 260608-exn
title: 사주 결과 화면 스와이프 뒤로가기 차단
date: 2026-06-08
status: complete
---

# Quick Task 260608-exn — Summary

## 목표
사주풀이 결과 화면에서 좌측 엣지 스와이프(뒤로가기 제스처)를 하면 풀이가 사라져 다시
볼 수 없는 문제를 수정한다.

## 원인
- 결과 단계는 라우트가 아니라 페이지 내부 state(`currentPage === 'result'`)로 관리됨.
- 토스 WebView의 좌측 엣지 스와이프가 브라우저 `popstate`(history back)를 발생시키면
  `/saju` 라우트 자체를 빠져나가 결과 화면(Result.jsx)이 언마운트되고 풀이가 유실됨.
- 앱에는 스와이프/popstate를 처리하는 코드가 전혀 없었음 (main.jsx는 init state 1개만 push).

## 변경 내용
- **`src/hooks/useBlockSwipeBack.js` (신규)**: 마운트 시 더미 history 엔트리를 push 하고,
  `popstate`가 발생할 때마다 같은 화면을 다시 push 해 스와이프 뒤로가기를 무력화하는
  재사용 훅. `enabled` 인자로 활성 제어, 언마운트 시 리스너 정리.
- **모든 결과 화면에 `useBlockSwipeBack()` 적용** (각 컴포넌트는 `currentPage === 'result'`
  단계에서만 마운트되므로 결과 화면에서만 자연히 활성화됨):
  - `src/components/Result.jsx` (사주풀이)
  - `src/components/DeepReadingResult.jsx` (신년운세/호환성 딥리딩 — 내부 채팅 state 관리, history 미사용이라 충돌 없음)
  - `src/components/AmuletResult.jsx` (부적 신청)
  - `src/components/TarotResult.jsx` (타로 원카드)

## 동작
- 결과 화면에서 스와이프/뒤로가기 → 즉시 같은 화면이 다시 push 되어 풀이가 유지됨.
- 화면 이탈은 "처음부터 다시하기" 버튼(`onRestart` → `navigate('/')`)으로 정상 동작.

## 검증
- `npx vite build` 통과 (신규 의존성 0).
- 변경 파일 lint 통과(추가한 훅 무에러). Result.jsx의 기존 lint 경고
  (`birthdate`/catch `e` 미사용)는 이번 변경과 무관한 기존 코드라 미수정.

## 범위 메모
- 1차로 사주 결과 화면(Result.jsx)에 적용 후, 사용자 요청으로 모든 결과 화면
  (신년운세·부적·타로)에 동일 훅을 확대 적용.

## 커밋
- `8dae058` fix(quick-260608-exn): 사주 결과 화면 스와이프 뒤로가기 차단
- `e3e938a` docs(quick-260608-exn): PLAN/SUMMARY + STATE 기록
- `871f5ae` fix(quick-260608-exn): 신년·부적·타로 결과 화면에도 스와이프 뒤로가기 차단
