# Phase 3: 데일리 원카드 코어 화면 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-02
**Phase:** 03-daily-one-card-core
**Areas discussed:** 셔플/뒤집기 인터랙션 + framer-motion, 결과 화면 레이아웃, tarot_cards Supabase 스키마 + fetch 전략, 카드 이미지 형식

---

## 셔플/뒤집기 인터랙션 + framer-motion

### intro에서 shuffle로 넘어갔을 때 카드 선택 방식은 어떻게 할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 즉시 메인 카드 (Recommended) | shuffle 단계 생략, 바로 뒤집기 애니메이션. 최단순. | |
| 부채꼴 3장 중 1장 선택 | 프로토타입 패턴 포팅. framer-motion 사실상 필수. | ✓ |
| 카드 더미 1탭 후 뒤집기 | 단순 더미 + 1탭 → 뒤집기. CSS만으로 가능. | |

**User's choice:** 부채꼴 3장 중 1장 선택

**Notes:** Recommended가 아닌 옵션. 프로토타입 시각 풍성함 유지 우선. framer-motion은 다음 질문에서 미도입으로 확정 → CSS만으로 부채꼴 구현 (단순 transform + transition).

### 카드 뒤집기 애니메이션은 어떻게 구현할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| CSS keyframes / transform (Recommended) | rotateY(180deg) + 0.4s. 신규 의존성 없음. | ✓ |
| framer-motion 도입 | spring 타이밍 재현. ~50KB 추가. D-08 위반. | |
| 애니메이션 없이 즉시 결과 | 모션 없이 탭 → 결과 화면. UX 풀성 떨어짐. | |

**User's choice:** CSS keyframes / transform (Recommended)

### 22장 중 매 세션 랜덤 3장 추출, 모두 동일한 뒷면

| Option | Description | Selected |
|--------|-------------|----------|
| 22장 중 랜덤 3장, 동일 뒷면 (Recommended) | 프로토타입과 동일. 사용자 1장 탭하면 그 자리가 결과. | ✓ |
| 1장 미리 선정 후 3장 위치 랜덤 | 외부 동작 같으나 결과 미리 확정. | |
| 부채꼴 없이 단일 카드 | 부채꼴 구성 없이 1장만 표시. | |

**User's choice:** 22장 중 랜덤 3장, 모두 동일한 뒷면 (Recommended)

### '다시 뽑기' 동작 (Phase 4 광고 게이팅 이전)

| Option | Description | Selected |
|--------|-------------|----------|
| shuffle 단계로 돌아가 새 3장 (Recommended) | 결과 → 새 부채꼴. Phase 4가 클릭 앞에 광고 삽입. | ✓ |
| 결과 화면에서 카드만 즉시 교체 | 화면 전환 없이 결과만 교체. '뽑는' 느낌 약함. | |
| intro부터 다시 시작 | 가장 명확하나 동작 길어짐. | |

**User's choice:** shuffle 단계로 돌아가 새 3장 부채꼴 제시 (Recommended)

---

## 결과 화면 레이아웃 (TAROT-02)

### 카드 이미지 크기·위치

| Option | Description | Selected |
|--------|-------------|----------|
| 상단 중앙 큰 카드 + 아래 텍스트 (Recommended) | 화면 너비 50-60% 카드, 그 아래 수직 텍스트. | ✓ |
| 좌측 카드 + 우측 텍스트 수평 분할 | 공간 효율적, 4050 멘탈 모델에서 수직이 더 친숙. | |
| 전체 화면 카드 배경 + 오버레이 텍스트 | 도엘 풍성, 4050 가독성 도전. | |

**User's choice:** 상단 중앙 큰 카드 + 아래 텍스트 (Recommended)

### 카드 이름·키워드·메시지 표시

| Option | Description | Selected |
|--------|-------------|----------|
| 한국어명+영문명+이모지 + chip 키워드 + 메시지 (Recommended) | 헤더 한 줄 + chip 키워드 2-4개 + 메시지 소단락. 4050 구조 명확. | ✓ |
| 이름 + 메시지만 (키워드 생략) | 깔끔. 키워드는 메시지 안에 녹아있다는 가정. | |
| 키워드 인라인 한 줄 + 메시지 아래 | 수평 공간 효율적. chip보다 약함. | |

**User's choice:** 한국어명·영문명·이모지 + 키워드 chip + 메시지 소단락 (Recommended)

### '다시 뽑기' 버튼 위치

| Option | Description | Selected |
|--------|-------------|----------|
| 화면 하단 fixed (탭바 위) (Recommended) | 메시지 길이 무관 항상 도달. 4050 익숙한 자리. | ✓ |
| 결과 컨텐트 아래 인라인 | 자연 흐름이지만 메시지 길면 스크롤 필요. | |
| 결과 상단 floating button | 잘로 접근. 4050 멘탈 낯섬. | |

**User's choice:** 화면 하단 fixed 탭바 위 (Recommended)

---

## tarot_cards Supabase 스키마 + fetch 전략

### tarot_cards 테이블 스키마

| Option | Description | Selected |
|--------|-------------|----------|
| id·name_ko·name_en·emoji·image_path·keywords·message (Recommended) | Phase 1 권장 스키마 그대로. 메뉴 테이블 패턴 일관. | ✓ |
| 운영 메타데이터 포함 확장형 | created_at/updated_at/sort_order/is_active 추가. 본 페이즈 외 deferred. | |
| 메시지만 Supabase, 그 외 정적 | 메시지만 DB, 나머지 클라이언트 정적. D-07 일관성 약화. | |

**User's choice:** id·name_ko·name_en·emoji·image_path·keywords(text[])·message (Recommended)

### 카드 데이터 fetch 시점

| Option | Description | Selected |
|--------|-------------|----------|
| intro 진입 시 22장 전체 prefetch (Recommended) | 한 번에 캐싱, shuffle/result 즉시. | ✓ |
| shuffle 시점 prefetch | intro 빠르게, shuffle 시 부담. | |
| result 진입 시 1장만 fetch | 메모리 최소, result 전환 시 네트워크 의존. | |

**User's choice:** intro 진입 시 22장 전체 prefetch (Recommended)

### fetch 에러·대기 처리

| Option | Description | Selected |
|--------|-------------|----------|
| intro 로딩 스피너 + 재시도 버튼 (Recommended) | HomePage 패턴 일관. Sentry 기록. | ✓ |
| 정적 fallback 데이터 | 클라이언트에 cards.ts 포팅 fallback. D-07 변태. | |
| toast 후 이전 단계 복귀 | useToast + 단순 복귀. 재시도 어색. | |

**User's choice:** intro 로딩 스피너 + 재시도 버튼 (Recommended)

---

## 카드 이미지 형식

### 22장 형식 결정

| Option | Description | Selected |
|--------|-------------|----------|
| webp 그대로 유지 (Recommended) | 프로토타입 .webp 직접 복사. 파일 크기 ~50% 이점. | ✓ |
| PNG 변환 | 기존 .png 일관. 파일 크기 ~2배. | |
| WebP + PNG 폴백 | <picture> 폴백. AIT 환경 단순화 우선. | |

**User's choice:** webp 그대로 유지 (Recommended)

---

## Claude's Discretion

다음 항목은 Phase 3 실행자(planner/executor)가 결정:

- state 관리 위치 (TarotPage useState로 시작, 필요 시 Context 승격)
- 22장 중 랜덤 3장 추출 알고리즘 (Math.random vs crypto)
- 부채꼴 각도/간격 정확값
- 카드 뒷면 디자인 (프로토타입 라벤더+별 vs 단순화)
- `getCardImageUrl(id)` 위치/시그니처
- intro 페이지 카피 문구
- shuffle 단계 부채꼴 펼침 타이밍
- 결과 화면 키워드 chip 색상 토큰
- '다시 뽑기' 버튼 라벨

---

## Deferred Ideas

본 페이즈 외에서 다룰 항목 (CONTEXT.md `<deferred>` 참조):

- 광고 시청 게이팅 (Phase 4)
- Firebase Analytics 이벤트 (Phase 5)
- 토스 공유 시트 (Phase 5)
- archive (카드 히스토리) — 다음 마일스톤
- '오늘의 카드' 하루 1회 잠금 — 광고 모델 검증 후 재검토
- 사주 ↔ 타로 데이터 통합 — 다음 마일스톤

---

*Phase: 03-daily-one-card-core*
*Discussion log written: 2026-05-02*
