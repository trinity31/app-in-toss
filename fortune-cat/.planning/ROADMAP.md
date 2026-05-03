# Roadmap: 복냥사주 v1.1 — 복냥타로 통합 (별도 탭)

**Created:** 2026-04-29
**Milestone:** v1.1 복냥타로 통합 (별도 탭)
**Goal:** 데일리 원카드 타로 경험을 하단 탭바 형태로 복냥사주에 통합해, 4050 여성 사용자의 재방문과 체류를 늘린다.
**Granularity:** standard
**Coverage:** 14/14 v1.1 requirements mapped

## Phases

- [ ] **Phase 1: 타로 프로토타입 발굴 및 포팅 평가** — 외부 레포의 타로 프로토타입을 식별·평가해 통합 가능한 자산과 갭을 명확히 한다
- [ ] **Phase 2: 하단 탭바 네비게이션 셸** — 사주/타로 두 탭 전환 가능한 셸을 도입하면서 기존 사주 흐름을 깨뜨리지 않는다
- [ ] **Phase 3: 데일리 원카드 코어 화면** — 사용자가 타로 탭에서 카드를 뒤집어 오늘의 한 장을 받고 다시 뽑기를 시작할 수 있다
- [ ] **Phase 4: 데일리 lock + 영속 저장 + 자정 리셋** — 그날 뽑은 카드가 자정까지 lock 되어 같은 날 재진입 시 동일 결과가 표시되고, 자정에 자동 리셋된다 (앱 재시작·새로고침에도 유지)
- [ ] **Phase 5: 공유 + Analytics 마무리** — 결과 공유와 핵심 사용자 행동 이벤트가 모두 기록되어 v1.1 출시 준비가 완료된다

## Phase Details

### Phase 1: 타로 프로토타입 발굴 및 포팅 평가
**Goal**: 외부 레포의 타로 프로토타입을 식별·평가해 통합 가능한 자산(카드 데이터, 인터랙션, 해석 텍스트)과 포팅 시 갭(디자인 시스템, 의존성, 라우팅)을 명확히 한다
**Depends on**: Nothing (first phase)
**Requirements**: (요구사항 직접 매핑 없음 — 후속 페이즈를 가능케 하는 준비 페이즈)
**Success Criteria** (what must be TRUE):
  1. 사용자(개발자)가 프로토타입 레포 경로와 핵심 자산(카드 이미지·해석 데이터·인터랙션 코드) 위치를 문서화된 형태로 확인할 수 있다
  2. 사용자가 포팅 대상(데일리 원카드 흐름)과 v1.1에서 제외할 항목(주제별/스프레드/유료)을 명시적으로 구분한 결과를 검토할 수 있다
  3. 사용자가 fortune-cat의 디자인 시스템(TDS Mobile/AIT)·의존성·라우팅과 충돌하는 항목 목록을 확인할 수 있다
  4. 사용자가 카드 이미지·해석 텍스트의 보관 위치(Supabase Storage vs `public/images` vs 정적 임포트)를 결정한 산출물을 확인할 수 있다
**Plans:** 1 plan
Plans:
- [x] 01-01-PLAN.md — boknyang-tarot 자산 인벤토리(01-INVENTORY.md) + 포팅 갭 매트릭스(01-GAPS.md) 작성

### Phase 2: 하단 탭바 네비게이션 셸
**Goal**: 사주/타로 두 탭을 한 번의 탭으로 전환할 수 있는 하단 탭바 셸을 도입하면서, 기존 사주 흐름(`/`, `/saju`, `/new-year`, `/amulet`)을 동일하게 유지한다
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. 사용자가 앱 하단 탭바에서 "사주"와 "타로" 두 탭을 보고 한 번의 탭으로 즉시 전환할 수 있다
  2. 사용자가 현재 어느 탭에 있는지 아이콘·컬러로 명확히 인지할 수 있다 (4050 여성 사용자 hit area·대비 기준 충족)
  3. 사용자가 기존 홈/사주/신년운세/부적 흐름을 v1.0과 동일한 진입 경로·결과 화면으로 이용할 수 있다 (회귀 없음)
  4. 사용자가 탭바가 부적 결제·딥리딩 등 풀스크린 흐름을 가리지 않는 시점에만 노출되는 것을 확인할 수 있다
**Plans:** 1 plan
Plans:
- [x] 02-01-PLAN.md — 하단 탭바(TabBar.jsx) + /tarot 라우트 + TarotPage 빈 컨테이너 + App.jsx 통합
**UI hint**: yes

### Phase 3: 데일리 원카드 코어 화면
**Goal**: 사용자가 타로 탭에서 카드 뒷면을 보고 한 장을 뒤집어 오늘의 카드(이미지·이름·해석)를 확인하고, 결과 화면에서 다시 뽑기 액션을 시작할 수 있다
**Depends on**: Phase 2
**Requirements**: TAROT-01, TAROT-02, TAROT-03
**Success Criteria** (what must be TRUE):
  1. 사용자가 타로 탭에 진입했을 때 카드 뒷면을 보고 한 장을 뒤집는 동작으로 오늘의 카드를 뽑을 수 있다
  2. 사용자가 결과 화면에서 카드 이미지·카드 이름·해석 텍스트를 한 화면에서 함께 볼 수 있다
  3. 사용자가 결과 화면에서 "다시 뽑기" 액션을 명확히 식별하고 시작할 수 있다 (Phase 4에서 광고로 게이팅됨)
  4. 사용자가 4050 여성 기준으로 텍스트 사이즈·여백·콘트라스트가 편안한 상태로 결과를 읽을 수 있다
**Plans:** 3 plans (3 waves)
Plans:
- [x] 03-01-PLAN.md — 데이터 레이어 (tarot_cards 마이그레이션 + 22장 webp 정적 import + fetchTarotCards/getCardImageUrl 헬퍼) [Wave 1]
- [x] 03-02-PLAN.md — UI 컴포넌트 (TarotCardArt 포팅 + TarotShuffle 부채꼴+CSS 3D 뒤집기 + TarotResult fixed 다시뽑기) [Wave 2, depends_on: 01]
- [ ] 03-03-PLAN.md — TarotPage 통합 + UI-SPEC Checker Sign-Off + 수동 디바이스 검증 [Wave 3, depends_on: 01, 02]
**UI hint**: yes

### Phase 4: 데일리 lock + 영속 저장 + 자정 리셋
**Goal**: 사용자가 카드를 뽑으면 그날 카드가 KST 자정까지 lock 되어 같은 날 재진입 시 같은 결과 화면이 표시되고, 자정에 lock 이 해제되어 새 카드를 뽑을 수 있다. 저장은 앱 재시작·새로고침에도 유지된다.
**Depends on**: Phase 3
**Requirements**: DAILY-01, DAILY-02, DAILY-03
**Success Criteria** (what must be TRUE):
  1. 사용자가 카드를 뽑은 후 같은 날(KST 자정 전) 타로 탭에 다시 진입하면 그날 뽑은 카드의 결과 화면이 표시된다 (intro/shuffle 단계 건너뜀)
  2. 사용자가 KST 자정(00:00) 이후 진입하면 새 카드를 뽑을 수 있는 intro 단계가 다시 표시된다
  3. 사용자가 앱을 재시작하거나 페이지를 새로고침해도 그날 뽑은 카드가 유지된다 (Toss Storage / localStorage 영속성)
  4. 저장된 카드 데이터가 손상·미존재 케이스에서도 graceful degradation (intro 로 fallback)
**Plans:** 2 plans
Plans:
- [x] 04-01-PLAN.md — useTodayDrawStorage 훅 + todayKST 헬퍼 (Toss Storage 영속 저장 + KST 자정 비교 데이터 레이어) [Wave 1]
- [x] 04-02-PLAN.md — TarotPage 통합 (useEffect lock 분기 + handleSelectCard 저장 호출 + intro CTA 분기) [Wave 2, depends_on: 01]
**Replaces**: 광고 게이팅 + 무제한 다시 뽑기 (2026-05-03 v1.1 수익 모델 전환으로 폐기. 광고 도입은 LLM 기능 출시 시점 v1.2+ 에서 재검토.)

### Phase 5: 공유 + Analytics 마무리
**Goal**: 사용자가 데일리 원카드 결과를 토스 공유 시트로 외부에 공유할 수 있고, 타로 탭 진입·카드 뽑기·공유 3종 이벤트가 Firebase Analytics에 기록되어 v1.1 출시 준비가 완료된다
**Depends on**: Phase 4
**Requirements**: SHARE-01, ANL-01, ANL-02, ANL-03
**Success Criteria** (what must be TRUE):
  1. 사용자가 데일리 원카드 결과 화면에서 토스 공유 시트로 카드/해석을 외부에 공유할 수 있다 (v1.0 결과 공유 패턴 재사용)
  2. 사용자가 타로 탭에 진입하면 Firebase Analytics에 진입 이벤트가 기록된다 (`already_drawn` 플래그 포함 — daily lock retention 측정)
  3. 사용자가 카드를 뽑으면 카드 식별자를 포함한 카드 뽑기 이벤트가 Firebase Analytics에 기록된다
  4. 사용자가 결과를 공유하면 공유 이벤트가 Firebase Analytics에 기록된다
  5. 사용자가 v1.1 출시 후 3종 이벤트(타로 진입·카드 뽑기·공유)를 Firebase 콘솔에서 모두 확인할 수 있다
**Plans**: TBD
**UI hint**: yes

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 타로 프로토타입 발굴 및 포팅 평가 | 0/1 | Planned | - |
| 2. 하단 탭바 네비게이션 셸 | 0/1 | Planned | - |
| 3. 데일리 원카드 코어 화면 | 0/3 | Planned | - |
| 4. 데일리 lock + 영속 저장 + 자정 리셋 | 0/2 | Planned | - |
| 5. 공유 + Analytics 마무리 | 0/0 | Not started | - |

## Coverage Summary

- **Total v1.1 requirements:** 13
- **Mapped:** 13 (100%)
- **Orphaned:** 0
- **Phase 1 (preparation):** 0 requirements (포팅 평가 — 후속 페이즈를 가능케 하는 준비 페이즈)
- **Phase 2 (NAV):** NAV-01, NAV-02, NAV-03 (3)
- **Phase 3 (TAROT):** TAROT-01, TAROT-02, TAROT-03 (3)
- **Phase 4 (DAILY):** DAILY-01, DAILY-02, DAILY-03 (3)
- **Phase 5 (SHARE+ANL):** SHARE-01, ANL-01, ANL-02, ANL-03 (4)

**Retired (2026-05-03 v1.1 수익 모델 전환):** ADS-01, ADS-02, ADS-03, ANL-03(광고 시청 완료) — 광고 도입은 LLM 기능 출시 시점(v1.2+) 에 재검토 (`.planning/seeds/llm-features-and-monetization.md`).

## Notes

- **브라운필드 컨텍스트:** v1.0(사주·딥리딩·부적·광고·공유·Anonymous Key)은 이미 검증되어 운영 중. v1.1은 이 자산 위에 타로 탭만 얹는 통합 작업이다.
- **포팅 우선 전략:** 데일리 원카드 UI/인터랙션은 다른 로컬 레포의 완성 프로토타입에서 포팅한다. Phase 1은 발굴/평가 단계이며, 이후 페이즈가 실제 포팅·통합 작업을 진행한다.
- **재사용 자산:** 토스 공유 시트, Firebase `logEvent`, `useAnonymousKey`, Toss Storage 는 v1.0 패턴을 그대로 사용한다 — 신규 인프라 추가 없음. (광고 인프라는 본 마일스톤에서 사용 안 함.)
- **단일 라우트 유지:** v1.1에서는 별도 `/tarot` 라우트를 추가하지 않는다 (PROJECT.md Out of Scope). 탭바 전환은 `App.jsx`의 라우트 구조와 별개의 UI 셸로 구현한다.
- **수익 모델:** **데일리 무료 (광고 0, 결제 0)** — 한계 비용 0. 수익화는 LLM 기능 도입 시점(v1.2+)에 재검토.

---
*Roadmap created: 2026-04-29*
*Last updated: 2026-05-03 — Phase 4 redefined: 광고 게이팅 → 데일리 lock + 영속 저장 + 자정 리셋. ADS 요구사항 폐기, DAILY 요구사항 신규.*
