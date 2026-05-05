# 복냥사주 — 마일스톤 회고

**Last updated:** 2026-05-05

이 문서는 복냥사주 프로젝트의 마일스톤별 회고를 누적 보존합니다. 각 마일스톤 완료 시 `/gsd-complete-milestone` 워크플로가 새 섹션을 추가합니다.

---

## Milestone: v1.1 — 복냥타로 통합 (별도 탭)

**Shipped:** 2026-05-05
**Phases:** 5 | **Plans:** 8 | **Tasks:** 11
**Code:** 35 files (+1,713 / -9 lines), 5 days (2026-05-01 → 2026-05-05)
**Quick tasks:** 2 (HomePage 헤더 / TarotResult 모달+여백)

### What Was Built

- **하단 탭바 셸** — React Router 기반 사주/타로 2탭 + `/tarot` 라우트 (NAV-01/02/03)
- **데일리 원카드 코어** — Supabase `tarot_cards` + 22장 webp 정적 import + 3컴포넌트(Art/Shuffle/Result) + intro→shuffle→result 3단계 상태 머신 (TAROT-01/02/03)
- **데일리 lock + 자정 reset** — `useTodayDrawStorage` 훅 + `todayKST()` 헬퍼 + lock useEffect 통합 (DAILY-01/02/03)
- **공유 + Analytics** — 토스 공유 시트 실구현 + Firebase 3종 이벤트 (`tarot_view` / `card_drawn` / `card_shared`) + `복냥사주&타로` 브랜딩 (SHARE-01, ANL-01/02/03)
- **UAT 발견 fix (Quick tasks)** — HomePage H1 통합 / TarotResult 하단 버튼 여백 / 카드 이미지 확대 모달 (x · 백드롭 · ESC)

### What Worked

- **v1.0 패턴 재사용** — `useUserInfoStorage` → `useTodayDrawStorage`, HomePage `handleShare` → TarotPage `handleShare` 미러링이 신규 위험을 최소화. 신규 npm 의존성 0건(D-02 carry).
- **프로토타입 포팅 전략 (Phase 1)** — boknyang-tarot 자산 인벤토리 + 의존성 갭 매트릭스를 Phase 1 산출물로 만든 것이 Phase 2~3에서 의사결정 마찰을 크게 줄임.
- **브라운필드 회귀 0** — TabBar 의 `VISIBLE_PATHS` Set + 라우트별 null 반환 패턴이 v1.0 5개 라우트(/, /saju, /new-year, /amulet, /home) 무수정으로 회귀 0 달성.
- **Quick task 흐름** — UAT 진행 중 발견된 두 이슈(버튼 여백, 카드 확대 요구)를 그날 안에 atomic commit 으로 fix → 디바이스 재검증 → 통과. 발견-fix-검증 루프가 짧음.
- **REVIEW WR-01 catch** — code review 가 `tarot_view` 중복 발화 가능성을 Phase 5 verification 전에 catch → useRef 가드 fix 적용 → UAT § 4 에서 1회 발화 검증 통과.

### What Was Inefficient

- **Phase 03 verification 정식 절차 누락** — VALIDATION.md 만 작성되고 VERIFICATION.md 미생성. Phase 04/05 에서 implicit 카버되긴 했으나, post-hoc 처리 비용이 audit 에서 발생. v1.2 부터는 phase 종료 시 명시적 verifier 실행 강제.
- **REQUIREMENTS.md 체크박스 상시 미갱신** — 13/13 미체크 상태로 archive 까지 옴. 진행 중 phase 종료마다 갱신했다면 audit 갭을 줄였을 것.
- **v1.1 수익 모델 전환 (광고 무제한 → daily-lock 무료)** — 2026-05-03 늦은 시점 결정으로 ROADMAP/REQUIREMENTS retired 섹션 작성, Phase 4 명칭/목표 변경, TAROT-03 의미 재정의 등 "변경 비용". 다행히 Phase 3 종료 시점 직전이라 과도하지 않았으나, 수익 모델 결정은 milestone 시작 전 확정 권장.
- **OG 이미지 캐시** — Supabase Storage 같은 경로 교체 후 토스 단축링크 캐시가 옛 이미지 반환. v1.1 accept 했으나 cache-busting 쿼리스트링 도입은 v1.2 검토 항목.

### Patterns Established

- **Quick task로 UAT 발견 이슈 fix** — `.planning/quick/{YYMMDD-xxx}-{slug}/` 디렉토리 + atomic commit 분리 + STATE.md `Quick Tasks Completed` 표 추적.
- **인간 UAT 체크리스트 (`vX.X-HUMAN-UAT-CHECKLIST.md`)** — phase 별 verification frontmatter `human_verification:` 섹션을 한 페이지로 집계 + 체크박스 + § 7 발견 이슈 메모. milestone archive 직전까지 진행 추적.
- **시드(parked)** — 다음 마일스톤 후보를 `.planning/seeds/{topic}.md` 로 보존. trigger / status / related_requirements 프론트매터로 인덱스화.
- **TarotCardArt size 토큰 확장 패턴** — sm/md/lg/xl 토큰 추가 + matPad 분기 한 줄. 모달 등 새 사용처에서 size prop 만 변경하면 됨.

### Key Lessons

- **브라운필드 통합은 "무수정 회귀 0" 을 가장 먼저 보장하라** — TabBar 의 `VISIBLE_PATHS` 패턴이 v1.0 페이지 0행 변경을 가능케 했고, Phase 02 verification 자동 검증 5/5 가 그것을 즉시 입증.
- **Plan 의 "TarotCardArt 무수정" 같은 self-imposed 잠금은 사용자 피드백 시 변경 가능** — 모달 카드 사이즈 확대 요청에서 plan 결정을 수정해 xl 토큰을 추가. 잠금은 잠재적 회귀 회피를 위함이지 신성하지 않음.
- **인간 UAT 항목은 verification frontmatter 의 `human_verification:` 에 작성 시점에 정의** — Phase 03 처럼 누락하면 milestone archive 시점에 implicit pass 처리 비용 발생.
- **Quick task 흐름이 milestone archive 전 발견 이슈에 효과적** — `/gsd-quick` 의 plan→execute 분리 + atomic commit 으로 archive 시 한 번에 정리 가능. UAT 디바이스 검증과 빠른 fix 루프가 자연스럽게 결합.

### Cost Observations

- **Model mix:** opus (planner, gsd-quick), sonnet (executor, integration-checker, code-reviewer), haiku — 추정. 정확한 측정은 다음 마일스톤부터 도입 권장.
- **Sessions:** 5 days, 다수 session
- **Notable:** 5 phase + 2 quick task + 1 milestone archive 가 5일 내 완료. 신규 의존성 0 + 회귀 0 으로 운영 비용 추가 0.

---

## Cross-Milestone Trends

(첫 마일스톤이라 비교 데이터 없음. v1.2 완료 시점부터 누적 비교.)

| Milestone | Phases | Plans | Tasks | Days | Files Δ | 회귀 | 신규 의존성 |
|-----------|--------|-------|-------|------|---------|------|-------------|
| v1.1 (복냥타로 통합) | 5 | 8 | 11 | 5 | 35 (+1,713 / -9) | 0 | 0 |

### 누적 시그니처 패턴

- **신규 의존성 0건 유지** — D-02 carry 가 두 마일스톤 이상 유지될지 v1.2 에서 추적
- **v1.0 회귀 0 유지** — 브라운필드 신규 통합 시 회귀 0 보장 패턴 정착 여부
- **자체 테스트 인프라 도입 시점** — Nyquist 0/5 → 5/5 전환 시점 추적 (v1.2 후보)
