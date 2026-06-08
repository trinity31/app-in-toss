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
- **`src/hooks/useBlockSwipeBack.js` (신규)**: 마운트 시 네이티브 뒤로가기를 차단하고
  언마운트 시 해제하는 재사용 훅. 결과 화면에서만 차단하고 다른 화면은 보존.
  `isSupported?.()`/try/catch로 개발 브라우저 등 미지원 환경 graceful degradation.
  플랫폼별 분기:
  - **iOS**: `setIosSwipeGestureEnabled({ isEnabled: false })` — 좌측 엣지 스와이프만 비활성,
    TDS 백버튼은 동작 보존(승인된 동작 유지). backEvent 미등록.
  - **Android**: `graniteEvent.addEventListener('backEvent', { onEvent })` — 리스너 등록 시
    기본 뒤로가기가 차단되고 onEvent가 대신 호출(공식 문서 확인). onEvent에서
    `window.confirm('뒤로가기 시 결과를 다시 생성해야 해요. 나가시겠어요?')`를 띄워 확인 시
    onLeave(이탈) 실행, 취소 시 화면 유지. → 백버튼이 죽지 않고 동작하며 스와이프 시 안내 문구.
  - (popstate → 네이티브 브리지 → Android 무동작 차단 → 확인 다이얼로그로 단계적 정정)
- **모든 결과 화면에 `useBlockSwipeBack(onLeave)` 적용** — 각 화면의 이탈 핸들러 전달
  (Result/DeepReadingResult/AmuletResult=onRestart, TarotResult=onHome). 최신 onLeave는
  ref로 유지해 리렌더 재등록 방지. (각 컴포넌트는 `currentPage === 'result'`
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
- **네이티브 동작이라 실기기 확인 필요** — iOS 확인 완료(사용자). Android는 backEvent
  적용 후 실기기 확인 대기. 개발 브라우저에서는 미지원이라 graceful degradation으로 무동작.

## 플랫폼 제약 (중요)
- **iOS 엣지 스와이프는 `backEvent`로 가로챌 수 없다** — 전용 API `setIosSwipeGestureEnabled`가
  별도로 존재하며 on/off만 가능(콜백 없음). 따라서 iOS 스와이프에는 확인 다이얼로그를 띄울 수
  없고, 비활성화만 가능하다. iOS 백버튼은 유지(정상 이탈).
- **Android는 시스템 제스처와 백버튼이 동일한 `backEvent`** — 둘을 구분하는 API가 없다.
  그래서 확인 다이얼로그가 제스처·백버튼 모두에 동일하게 뜬다(백버튼만 무음 처리는 불가).
- 결과적으로 "스와이프만 다이얼로그, 백버튼은 무음 이탈"은 기술적으로 불가능. 최선의 근사:
  iOS=스와이프 차단+백버튼 정상, Android=모든 뒤로가기에 확인 다이얼로그(백버튼 동작 유지).

## 추가 이슈: 결과 화면 하단 과다 여백 (Android)
- **증상**: Android 결과 화면 하단 고정 버튼바 아래에 불필요한 빈 공간.
- **원인**: 앱이 `viewport-fit=cover`를 쓰지 않아 CSS `env(safe-area-inset-*)`가 신뢰 불가.
  토스 WebView가 시스템 내비 영역만큼 값을 반영하면서 `calc(24px + env(safe-area-inset-bottom))`
  하단 패딩이 과해졌다(홈 플로팅 탭바가 바닥에서 떠 보이는 것과 동일 원인).
- **수정**: Apps-in-Toss 공식 API `SafeAreaInsets.get()/subscribe()`로 정확한 픽셀 인셋을 읽는
  `useSafeAreaInsets` 훅(신규) 추가. 결과 화면 4곳의 `env(safe-area-inset-*)`를 모두 인셋 값으로 교체
  (Result/DeepReadingResult/AmuletResult 하단 버튼바, TarotResult 상/하단·고정 CTA·확대모달 닫기).
  미지원 환경은 0으로 degradation. → 커밋 `2bc98ae`. **Android 실기기 재확인 필요.**
- 참고: 탭바/홈 등 결과 화면 외 `env()` 사용처는 이번 범위에서 제외(보고된 결과 화면만).

## 범위 메모
- 1차로 사주 결과 화면(Result.jsx)에 적용 후, 사용자 요청으로 모든 결과 화면
  (신년운세·부적·타로)에 동일 훅을 확대 적용.

## 커밋
- `8dae058` fix(quick-260608-exn): 사주 결과 화면 스와이프 뒤로가기 차단
- `e3e938a` docs(quick-260608-exn): PLAN/SUMMARY + STATE 기록
- `871f5ae` fix(quick-260608-exn): 신년·부적·타로 결과 화면에도 스와이프 뒤로가기 차단
- `f247826` docs(quick-260608-exn): 모든 결과 화면 확대 적용 SUMMARY/STATE 갱신
- `8325131` fix(quick-260608-exn): 스와이프 차단을 네이티브 브리지로 교체 (popstate 가설 정정)
- `cfd1eb2` docs(quick-260608-exn): 근본원인 정정(네이티브 제스처) SUMMARY 갱신
- `fb6bc50` fix(quick-260608-exn): Android 뒤로가기도 차단 (backEvent)
- `4cc1237` docs(quick-260608-exn): Android backEvent 적용 SUMMARY/STATE 갱신
- `548c1af` fix(quick-260608-exn): Android 뒤로가기 시 확인 다이얼로그로 전환
