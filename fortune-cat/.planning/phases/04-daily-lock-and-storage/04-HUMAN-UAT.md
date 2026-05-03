---
status: partial
phase: 04-daily-lock-and-storage
source: [04-VERIFICATION.md]
started: 2026-05-03T03:30:00.000Z
updated: 2026-05-03T03:30:00.000Z
---

## Current Test

[awaiting human testing — Toss Storage API 가 AIT WebView 안에서만 동작하므로 디바이스/브라우저 검증 필요]

## Tests

### 1. DAILY-01 — 같은 날 재진입 lock
expected: 토스 인앱(AIT WebView)에서 카드 1장을 뽑은 후 앱을 종료하고 다시 타로 탭에 진입 → intro/shuffle 단계 건너뛰고 즉시 result 화면이 표시된다 (같은 카드).
result: [pending]

### 2. DAILY-02 — KST 자정 리셋
expected: 디바이스 시각을 다음 날 00:01 (KST) 로 변경 후 재진입 → 새 intro 단계가 표시되고, intro CTA 라벨이 "오늘의 카드 뽑기 ✨" 로 표시 (다시 보기 ✨ 가 아닌). 새 카드 뽑기 가능.
result: [pending]

### 3. DAILY-03 — 새로고침 영속성
expected: 카드 뽑은 후 페이지 새로고침 (또는 앱 재시작) → 같은 카드가 result 화면에 직진. AIT 빌드 + WebView 모두에서 확인.
result: [pending]

### 4. Graceful degradation — 일반 브라우저
expected: `npm run dev` 로 일반 브라우저 (Chrome/Safari) 에서 /tarot 진입 → Storage 미지원 환경이지만 throw 없이 정상 동작 (intro → shuffle → result 흐름). lock 작동 안 함 (메모리 fallback).
result: [pending]

### 5. D-13 intro CTA 라벨 분기
expected: 카드 뽑은 상태에서 result → "처음으로" 탭 → intro 화면에서 CTA 라벨이 "오늘의 카드 다시 보기 ✨" 로 자동 표시 (todayDraw state 잠금됨).
result: [pending]

### 6. D-14 intro Resume 동작
expected: intro 의 "다시 보기 ✨" CTA 탭 → shuffle 단계 건너뛰고 즉시 result 화면 (같은 카드) 표시.
result: [pending]

### 7. NAV-03 v1.0 회귀 방지
expected: 사주 탭으로 이동 → 사주/신년운세/부적/딥리딩 v1.0 흐름 모두 정상 동작. Phase 4 추가 코드로 인한 회귀 없음.
result: [pending]

### 8. 손상 데이터 자동 복구
expected: DevTools/AIT debug 콘솔에서 Toss Storage 의 `FORTUNE_CAT_TAROT_TODAY_DRAW` 값을 잘못된 JSON 으로 변조 후 새로고침 → 자동으로 removeItem 정리되고 intro 화면 표시 (에러 화면 아님). production 빌드면 Sentry 에 손상 이벤트 1회 보고.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps
