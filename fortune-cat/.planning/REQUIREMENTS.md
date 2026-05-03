# Requirements: 복냥사주 (Fortune Cat)

**Defined:** 2026-04-29
**Last updated:** 2026-05-03 — v1.1 수익 모델 전환 (광고 무제한 → daily-lock 무료. 수익화는 LLM 기능 도입 시점에 재검토)
**Core Value:** 편하게 보는 정확한 사주

본 문서는 마일스톤 v1.1(복냥타로 통합) 기준의 요구사항을 정의합니다. v1.0의 검증된 기능은 PROJECT.md `Validated` 섹션에 별도 기록되어 있습니다.

## v1.1 Requirements

### Navigation (탭바)

- [ ] **NAV-01**: 사용자가 앱 하단 탭바에서 "사주"와 "타로"를 한 번의 탭으로 전환할 수 있다
- [ ] **NAV-02**: 탭바에서 현재 활성 탭이 시각적으로 명확히 강조된다 (아이콘·컬러)
- [ ] **NAV-03**: 기존 사주 흐름(`/`, `/saju`, `/new-year`, `/amulet`)이 탭바 도입 후에도 동일하게 동작한다

### Tarot Core (데일리 원카드)

- [ ] **TAROT-01**: 사용자가 타로 탭에서 카드 뒷면을 보고 한 장을 뒤집어 오늘의 카드를 뽑을 수 있다
- [ ] **TAROT-02**: 결과 화면에 카드 이미지·이름·해석 텍스트가 함께 표시된다
- [ ] **TAROT-03**: 사용자가 결과 화면에서 "처음으로(intro 복귀)" 액션을 시작할 수 있다 (공유하기는 SHARE-01 별도 매핑)

### Daily Lock (하루 한 번 + 자정 리셋)

- [ ] **DAILY-01**: 사용자가 카드를 뽑은 후 같은 날(KST 자정 전) 타로 탭에 다시 진입하면, 새 카드를 뽑는 흐름 대신 그날 뽑은 카드의 결과 화면이 표시된다
- [ ] **DAILY-02**: KST 자정(00:00) 이 지나면 lock 이 해제되어 사용자가 새 카드를 뽑을 수 있다
- [ ] **DAILY-03**: 사용자가 앱을 재시작하거나 페이지를 새로고침해도 그날 뽑은 카드가 유지된다 (Toss Storage / localStorage 영속성)

### Sharing

- [ ] **SHARE-01**: 사용자가 데일리 원카드 결과(카드/해석)를 토스 공유 시트로 외부에 공유할 수 있다

### Analytics

- [ ] **ANL-01**: 사용자가 타로 탭에 진입하면 Firebase Analytics에 진입 이벤트가 기록된다 (`already_drawn` 플래그 포함)
- [ ] **ANL-02**: 사용자가 카드를 뽑으면 카드 뽑기 이벤트가 기록된다 (카드 식별자 포함)
- [ ] **ANL-03**: 사용자가 결과를 공유하면 공유 이벤트가 기록된다

## Future Requirements

다음 마일스톤 후보. 트래킹은 하지만 현재 로드맵에는 포함되지 않습니다.

### 22장 컬렉션 메타게임 (v1.2 후보)

- **COLLECT-01**: 사용자가 daily one-card 로 뽑은 카드들을 누적해 22/22 컬렉션 진행률을 확인할 수 있다
- **COLLECT-02**: 22/22 완성 시 보상(부적/딥리딩/LLM 기능 무료 1회) 이 발급된다
- *상세 설계: `.planning/seeds/22-card-collection-meta-game.md`*

### LLM 기반 기능 + 수익화 (v1.2 후보)

- **LLM-01**: 사용자가 자유 텍스트로 고민을 입력하면 LLM 이 카드 1장 + 맥락 답변을 제공한다
- **LLM-02**: 사용자가 3-card 스프레드(과거·현재·미래)를 받을 수 있다
- **PAY-01**: LLM 기반 기능을 인앱결제 / 광고 시청 / 컬렉션 보상 등으로 게이팅한다
- *상세 설계: `.planning/seeds/llm-features-and-monetization.md`*

### 주제별 타로 리딩

- **THEME-01**: 사용자가 연애·금전·취업 등 주제를 선택해 주제별 타로 해석을 받을 수 있다
- **THEME-02**: 주제별 해석은 AI 기반 텍스트(딥리딩 채팅 후속 가능)로 제공된다

### 타로 결제 상품 (LLM 외 별도)

- **PAY-02**: 사용자가 타로 부적/굿즈를 토스 인앱결제로 구매할 수 있다
- **PAY-03**: 사용자가 타로 딥리딩(채팅형)을 유료로 이용할 수 있다

### 사주↔타로 데이터 통합

- **CROSS-01**: 사용자가 사주에서 입력한 생년월일·성별이 타로 해석에 반영된다

## Out of Scope

이번 마일스톤(v1.1)에서 명시적으로 제외하는 항목입니다. 스코프 크리프 방지를 위해 사유와 함께 기록합니다.

| Feature | Reason |
|---------|--------|
| 광고 기반 수익화 (AdMob 보상형 등) | v1.1 daily-one-card 는 한계 비용 0 — 광고 도입 근거 없음. LLM 기능 도입 시점(v1.2+)에 재검토 |
| 22장 컬렉션 메타게임 (기록 탭, 진행률, 보상) | retention 후크 후보지만 v1.1 정착 데이터 보고 v1.2 에서 도입 |
| LLM 기반 고민상담 / 3-card 스프레드 | LLM 비용 발생 → 수익화 모델과 함께 v1.2+ 에서 도입 |
| 주제별 타로 리딩 (연애/금전/취업) | 데일리 원카드 검증을 우선, 다음 마일스톤 후보 |
| 스프레드(3장/5장) 리딩 | 인터랙션 복잡도 높음, 다음 마일스톤 후보 |
| 타로 부적/굿즈 IAP | v1.0 부적 인프라 재활용 가능하나, daily 정착 후 cross-sell 기획 |
| 별도 신규 라우트 (`/tarot` 등) 추가 | 결제 흐름이 없어 탭바 전환만으로 충분, 라우트 분리 시 토스 심사·딥링크 부담 |
| 사주↔타로 데이터 통합 (입력 공유 등) | 통합 단계는 별도 마일스톤에서 일관성 있게 설계 |
| 자체 회원/계정 시스템 | 토스 익명키 + 토스 로그인(부적 결제 한정)으로 충분 |

## Traceability

요구사항이 어느 페이즈에 매핑되는지 기록합니다 — ROADMAP.md `Phase Details` 섹션과 동기화되어야 합니다.

| Requirement | Phase | Status |
|-------------|-------|--------|
| NAV-01 | Phase 2 | Done |
| NAV-02 | Phase 2 | Done |
| NAV-03 | Phase 2 | Done |
| TAROT-01 | Phase 3 | In progress |
| TAROT-02 | Phase 3 | In progress |
| TAROT-03 | Phase 3 | In progress |
| DAILY-01 | Phase 4 | Pending |
| DAILY-02 | Phase 4 | Pending |
| DAILY-03 | Phase 4 | Pending |
| SHARE-01 | Phase 5 | Pending |
| ANL-01 | Phase 5 | Pending |
| ANL-02 | Phase 5 | Pending |
| ANL-03 | Phase 5 | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 13 (100%)
- Unmapped: 0

**Phase 1 (타로 프로토타입 발굴 및 포팅 평가):** 요구사항 직접 매핑 없음 — 후속 페이즈를 가능케 하는 준비 페이즈로 ROADMAP.md에 기록됨.

## Retired Requirements (v1.1 전환 시 폐기)

다음 요구사항은 2026-05-03 v1.1 수익 모델 전환으로 폐기되었습니다. 이력 추적을 위해 보존합니다.

| Retired Requirement | Original Intent | Replaced by |
|---------------------|-----------------|-------------|
| ADS-01 (광고 후 결과 진입) | 광고 게이팅 1회 시청 | DAILY-01 (자정까지 같은 카드) |
| ADS-02 (광고 시청 시 무제한 다시 뽑기) | 광고 수익 + 무제한 redraw | DAILY-02 (자정 리셋만 허용) |
| ADS-03 (광고 실패 시 graceful degradation) | 광고 실패 fallback | (해당 없음 — 광고 자체가 사라짐) |
| ANL-03 (광고 시청 완료 이벤트) | 광고 retention 측정 | (해당 없음) |

폐기 사유: v1.1 daily-one-card 모델은 한계 비용 0 — 광고 도입 정당성 없음. 수익화는 LLM 기능 도입 시점(v1.2+)에 다시 검토.

---
*Requirements defined: 2026-04-29*
*Last updated: 2026-05-03 — v1.1 수익 모델 전환 (광고 폐기, daily lock 도입). 22장 컬렉션 + LLM 기능은 v1.2 seed 로 등록.*
