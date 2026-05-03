---
status: testing
phase: 03-daily-one-card-core
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md]
started: 2026-05-03T00:00:00.000Z
updated: 2026-05-03T00:00:00.000Z
---

## Current Test

number: 1
name: Cold Start Smoke Test
expected: |
  현재 dev 서버를 종료한 뒤 다시 `npm run dev` 로 부팅. localhost:8081 (또는 AIT preview) 접속 시 흰 화면·콘솔 에러 없이 홈(사주) 화면이 떠야 한다. 그 다음 하단 탭바에서 타로 탭 누르면 22장 fetch 로딩 → intro 화면 정상 진입.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: 현재 dev 서버를 종료한 뒤 다시 `npm run dev` 로 부팅. localhost:8081 (또는 AIT preview) 접속 시 흰 화면·콘솔 에러 없이 홈(사주) 화면이 떠야 한다. 그 다음 하단 탭바에서 타로 탭 누르면 22장 fetch 로딩 → intro 화면 정상 진입.
result: [pending]

### 2. 타로 탭 intro 화면 디자인
expected: 타로 탭 진입 시 (a) 베이비 핑크 #FFF7FB 배경, (b) ✦ 복냥타로 ✦ 라벤더 별 + 28px bold 타이틀, (c) 가운데 200px 복냥이 마스코트 (이마 ✨ + 든 발 흔들림), (d) "복냥이가 뽑아주는" + "오늘의 운세" (운세 라벤더), (e) "하루 한 번, 메이저 아르카나 한 장으로 마음을 톡 두드려요 🐾", (f) 라벤더 그라디언트 "오늘의 카드 뽑기 ✨" 버튼, (g) "하루 한 번, 자정에 초기화돼요 🌙" 푸터. CTA 와 푸터가 하단 탭바에 가려지지 않는다.
result: [pending]

### 3. shuffle 화면 인터랙션 + 디자인
expected: intro CTA 탭 시 shuffle 화면으로 전환. (a) 헤더 "마음에 드는 카드를 톡! 골라보라냥", (b) 부채꼴 3장 — 좌 -16°/중 0°/우 +16°, ±78px 간격, (c) 카드 뒷면 = 라벤더+크림 라디얼 그라디언트 + 골드 별 점 4개 + 이중 골드 프레임 + 중앙 골드 디스크의 🌙 + 코너 ✦ 4개. 카드 1장 탭 시 (d) 선택 카드는 60px 아래로 내려가며 1.35배 확대 + 약간 어두워짐, (e) 나머지 2장은 opacity 0.3 으로 페이드, (f) 안내 문구가 "이 카드로 결정할까냥?" 으로 변경, (g) 라벤더 그라디언트 "이 카드로 결정할래요 ✨" 버튼이 활성화 (선택 전엔 opacity 0.4 비활성).
result: [pending]

### 4. result 화면 자동 플립 + 컨텐츠
expected: 확정 버튼 탭 후 result 화면 진입. (a) 350ms 지연 후 카드가 0.9s 동안 rotateY 0→180 자동 플립, (b) 플립 완료 후 카드 앞면(webp 이미지) 표시, (c) 헤드라인 "한국어명 · 영문명" — 한국어명 dark, 구분자 muted, 영문명 라벤더, (d) 키워드 chip 2~4개 — bubble 배경 + dark 텍스트, (e) 흰색 메시지 카드 (라운드 24, soft shadow) — line-height 1.7, (f) 헤드라인/메시지가 플립 완료 시점에 fade-in (delay 0.6s/0.8s, 12px → 0). 메시지 끝까지 스크롤 가능 (CTA·탭바에 가리지 않음).
result: [pending]

### 5. result 액션 — 처음으로 버튼
expected: result 하단 가로 두 버튼 중 좌측 "처음으로" 탭 시 (a) intro 화면으로 즉시 복귀, (b) 마스코트 + ✦ 복냥타로 ✦ + "오늘의 카드 뽑기 ✨" CTA 가 다시 표시됨, (c) 다시 CTA 누르면 새 카드 3장이 부채꼴로 (이전과 다른 조합 가능).
result: [pending]

### 6. result 액션 — 공유하기 버튼 (Phase 5 stub)
expected: result 하단 우측 "공유하기 ✨" (라벤더 그라디언트) 탭 시 화면 변화 없음 — 본 페이즈는 stub 단계. 브라우저 콘솔에 `[TarotPage] share stub — Phase 5 SHARE-01 implements toss share sheet` 로그가 1회 출력된다. (Phase 5 가 토스 공유 시트 정식 연결 예정.)
result: [pending]

### 7. NAV-03 회귀 — 사주 탭 정상 동작
expected: 하단 탭바 좌측 "사주" 탭 누르면 v1.0 사주 홈(HomePage) 으로 이동. 사주/신년운세/부적 메뉴가 v1.0 과 동일하게 표시되고, 사주 풀이 입력 → 결과 흐름이 정상 작동. 타로 탭 도입으로 인한 회귀 없음.
result: [pending]

### 8. fetch 실패 시 에러 + 재시도 흐름
expected: DevTools Network → Offline 으로 전환 후 타로 탭 새로고침. (a) 짧은 Loader → "카드 데이터를 불러오지 못했어요 / 잠시 후 다시 시도해주세요" 에러 화면, (b) "다시 시도하기" 버튼 표시 (production 빌드면 Sentry 에 에러 이벤트 기록). Online 으로 복원 후 "다시 시도하기" 탭 → intro 화면으로 복귀.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps

[none yet]
