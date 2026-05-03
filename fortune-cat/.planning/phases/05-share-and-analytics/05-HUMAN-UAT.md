---
status: partial
phase: 05-share-and-analytics
source: [05-VERIFICATION.md]
started: 2026-05-03T05:10:00.000Z
updated: 2026-05-03T05:10:00.000Z
---

## Current Test

[awaiting human testing — Toss SDK + Firebase 콘솔이 AIT WebView/실제 환경 전용이라 디바이스 검증 필요]

## Tests

### 1. SHARE-01 — 토스 공유 시트 실제 노출 + 메시지 포맷
expected: AIT WebView (또는 Toss 앱 인앱 환경)에서 카드 뽑은 후 result 화면 → "공유하기 ✨" 탭 → 토스 공유 시트가 표시되고 메시지에 "[복냥타로] 오늘의 카드 — {nameKo} · {nameEn}" 헤드라인 + 메시지 80자 트림 + 토스 링크 포함.
result: [pending]

### 2. ANL-01 tarot_view — Firebase 콘솔 실제 수신
expected: Firebase Console DebugView 또는 Realtime → 타로 탭 진입 시 `tarot_view` 이벤트 1건 수신 (params: `already_drawn: false` 첫 진입). 카드 뽑은 후 재진입 시 `already_drawn: true` 로 발화.
result: [pending]

### 3. ANL-02 card_drawn — Firebase 콘솔 실제 수신
expected: shuffle 단계에서 카드 1장 + 확정 버튼 → `card_drawn` 이벤트 수신 (params: `card_id: 0~21`, `slot: 0|1|2`).
result: [pending]

### 4. ANL-03 card_shared — Firebase 콘솔 실제 수신
expected: 토스 공유 시트 share 성공 직후 `card_shared` 이벤트 1건 수신 (params: `card_id`, `with_link: true`). 사용자 취소·실패 시엔 발화 안 됨 (catch 블록).
result: [pending]

### 5. WR-01 fix 검증 — tarot_view 마운트당 1회
expected: DevTools/AIT debug 콘솔 → 카드 1번 뽑기 → result → 처음으로 → intro 재진입 (같은 마운트, lock 작동) — `tarot_view` 가 중복 발화되지 않음 (useRef 가드 동작).
result: [pending]

### 6. dev 브라우저 graceful degradation
expected: `npm run dev` 일반 브라우저에서 result → 공유하기 ✨ 탭 → 사용자 차단 없음 (silent fail). console.error 만 출력 (D-09 silent 정책 + WR-02 인지된 trade-off).
result: [pending]

### 7. D-04 displayName 토스 미니앱 카드 노출
expected: AIT 빌드 (또는 토스 콘솔 미니앱 미리보기) 에서 앱 진입 카드/공유 미리보기에 "복냥사주&타로" 표시 (이전 "복냥사주" 가 아닌).
result: [pending]

### 8. NAV-03 v1.0 회귀 방지
expected: 사주 탭으로 이동 → 사주/신년운세/부적/딥리딩 v1.0 흐름 모두 정상 동작. Phase 5 변경 (TarotPage + TarotShuffle + granite.config) 으로 인한 회귀 없음. 부적 결제 흐름도 정상.
result: [pending]

### 9. 사용자 외부 작업 — Supabase Storage og_image.png + Toss 콘솔
expected: 사용자가 별도로 (a) Supabase Storage `menu_images/og_image.png` 를 '복냥사주&타로' 통합 브랜딩 이미지로 교체, (b) 토스 미니앱 콘솔에서 등록명/아이콘을 '복냥사주&타로' 로 변경. 본 항목은 코드 외 작업이므로 verify 시점에 사용자 진행 상태 확인.
result: [pending]

## Summary

total: 9
passed: 0
issues: 0
pending: 9
skipped: 0
blocked: 0

## Gaps
