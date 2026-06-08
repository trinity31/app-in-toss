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

## 원인 (정정 — 1차 가설 오류)
- 결과 단계는 라우트가 아니라 페이지 내부 state(`currentPage === 'result'`)로 관리됨.
- **토스 WebView의 스와이프 뒤로가기는 iOS 네이티브 좌측 엣지 제스처**로, 브라우저
  `history`/`popstate` 스택과 분리되어 동작한다. 따라서 1차 시도(popstate 재push)는
  이벤트 자체가 발생하지 않아 무력했음 (사용자 재현으로 확인).
- web-framework는 이 제스처를 끄는 전용 브리지 `setIosSwipeGestureEnabled({ isEnabled })`를
  제공한다 (`@apps-in-toss/web-bridge` → `@apps-in-toss/web-framework` re-export).

## 변경 내용
- **`src/hooks/useBlockSwipeBack.js` (신규)**: 마운트 시 `setIosSwipeGestureEnabled({ isEnabled: false })`로
  네이티브 스와이프 제스처를 끄고, 언마운트 시 다시 켜는 재사용 훅. 결과 화면에서만 차단하고
  다른 화면의 스와이프 뒤로가기는 보존. `fn.isSupported?.()` + try/catch로 개발 브라우저 등
  미지원 환경 graceful degradation. (1차 popstate 방식 → 네이티브 브리지로 교체)
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
- `npx vite build` 통과 — Rollup이 `setIosSwipeGestureEnabled` named import 누락 에러를
  내지 않아 실제 export임이 확인됨. 신규 의존성 0.
- 변경 파일 lint 통과.
- **네이티브 제스처라 실기기(iOS 토스 인앱) 확인 필요** — 개발 브라우저에서는 미지원이라
  graceful degradation으로 무동작.

## 한계 / 후속
- `setIosSwipeGestureEnabled`는 **iOS 전용** API. Android의 시스템 뒤로가기 제스처는
  web-framework가 토글 API를 제공하지 않아 이 방식으로는 차단 불가(향후 backEvent 기반
  대응 검토 가능).

## 범위 메모
- 1차로 사주 결과 화면(Result.jsx)에 적용 후, 사용자 요청으로 모든 결과 화면
  (신년운세·부적·타로)에 동일 훅을 확대 적용.

## 커밋
- `8dae058` fix(quick-260608-exn): 사주 결과 화면 스와이프 뒤로가기 차단
- `e3e938a` docs(quick-260608-exn): PLAN/SUMMARY + STATE 기록
- `871f5ae` fix(quick-260608-exn): 신년·부적·타로 결과 화면에도 스와이프 뒤로가기 차단
- `f247826` docs(quick-260608-exn): 모든 결과 화면 확대 적용 SUMMARY/STATE 갱신
- `8325131` fix(quick-260608-exn): 스와이프 차단을 네이티브 브리지로 교체 (popstate 가설 정정)
