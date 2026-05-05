# Roadmap: 복냥사주

**Last updated:** 2026-05-05

## Milestones

- ✅ **v1.0 MVP** — 사주·딥리딩·부적·신년운세 (운영 중)
- ✅ **v1.1 복냥타로 통합 (별도 탭)** — Phases 1-5 (shipped 2026-05-05) — [archive](./milestones/v1.1-ROADMAP.md)
- 📋 **v1.2 (planned)** — 후보: 22장 컬렉션 메타게임 / LLM 기반 기능 + 수익화 / 카드 이미지 디바이스 저장 / Nyquist 자동 테스트 인프라

## Phases

<details>
<summary>✅ v1.1 복냥타로 통합 (Phases 1-5) — SHIPPED 2026-05-05</summary>

- [x] Phase 1: 타로 프로토타입 발굴 및 포팅 평가 (1/1 plan) — completed 2026-05-01
- [x] Phase 2: 하단 탭바 네비게이션 셸 (1/1 plan) — completed 2026-05-01
- [x] Phase 3: 데일리 원카드 코어 화면 (3/3 plans) — completed 2026-05-03
- [x] Phase 4: 데일리 lock + 영속 저장 + 자정 리셋 (2/2 plans) — completed 2026-05-03
- [x] Phase 5: 공유 + Analytics 마무리 (1/1 plan) — completed 2026-05-04

상세 phase 정의는 [v1.1-ROADMAP archive](./milestones/v1.1-ROADMAP.md) 에 보존.

</details>

### 🌱 v1.2 (planned)

다음 마일스톤은 v1.1 출시 후 사용자 행동 데이터(card_drawn vs card_shared 비율, daily lock retention, 22일 시점 재방문율)를 측정해 우선순위 결정 후 `/gsd-new-milestone` 으로 공식 정의.

**시드(parked):**
- [22장 카드 컬렉션 메타게임](./seeds/22-card-collection-meta-game.md) — 장기 retention 후크 후보 (high priority)
- [LLM 기반 기능 + 수익화](./seeds/llm-features-and-monetization.md) — LLM 고민상담 / 3-card 스프레드 / 결제·광고 게이팅
- [타로 카드 이미지 디바이스 저장](./seeds/tarot-image-save.md) — 사용자 요청, medium priority

## Progress

| Phase | Milestone | Plans Complete | Status      | Completed  |
|-------|-----------|----------------|-------------|------------|
| 1. 타로 프로토타입 발굴 및 포팅 평가 | v1.1 | 1/1 | Complete | 2026-05-01 |
| 2. 하단 탭바 네비게이션 셸 | v1.1 | 1/1 | Complete | 2026-05-01 |
| 3. 데일리 원카드 코어 화면 | v1.1 | 3/3 | Complete | 2026-05-03 |
| 4. 데일리 lock + 영속 저장 + 자정 리셋 | v1.1 | 2/2 | Complete | 2026-05-03 |
| 5. 공유 + Analytics 마무리 | v1.1 | 1/1 | Complete | 2026-05-04 |

## Notes

- **브라운필드 컨텍스트:** v1.0(사주·딥리딩·부적·신년운세) 운영 중. v1.1 통합 작업은 v1.0 페이지/lib 무수정으로 회귀 0 달성.
- **재사용 자산:** Toss 공유 시트, Firebase logEvent, useAnonymousKey, Toss Storage — v1.0 패턴을 그대로 사용. 신규 npm 의존성 0건 (D-02 carry).
- **출시 게이트:** UAT 21/22 trackable + 2/4 선택 추가 통과. 알려진 갭은 [MILESTONES.md](./MILESTONES.md) 참조.
