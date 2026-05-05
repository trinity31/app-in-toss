# 복냥사주 (Fortune Cat)

## What This Is

토스인앱 안에서 동작하는 AI 사주 풀이 웹앱입니다. 사용자가 이름·성별·생년월일·사진 등 간단한 정보를 입력하면 AI가 **편하게 보는 정확한 사주** 풀이를 제공하고, 신년운세 딥리딩(채팅), 부적 인앱결제까지 한 자리에서 즐길 수 있습니다. 주 사용자는 운세에 익숙한 4050 여성입니다.

## Core Value

**편하게 보는 정확한 사주** — 입력은 간단해야 하고, 풀이는 깊이 있고 정확해야 한다. 이 둘 중 하나라도 망가지면 제품 정체성이 흔들린다.

## Requirements

### Validated

<!-- v1.0 — 이미 토스인앱에 릴리즈되어 사용자에게 제공 중인 검증된 기능 -->

- ✓ 사용자가 이름·성별·생년월일(양력/음력·평달/윤달)을 입력해 사주 풀이를 받을 수 있다 — v1.0
- ✓ 사용자가 사진을 첨부해 이미지 기반 사주 풀이(룩북형)를 받을 수 있다 — v1.0
- ✓ 사용자가 신년운세 딥리딩(딥리딩 채팅 후속 질문)을 받을 수 있다 — v1.0
- ✓ 사용자가 부적을 토스 인앱결제로 구매하면 결과 부적 이미지를 받을 수 있다 — v1.0
- ✓ 결제가 중간에 끊긴 경우 사용자가 다음 진입 시 미완료 주문을 자동 복구할 수 있다 — v1.0
- ✓ 풀이 진행 중 광고를 시청해 무료 풀이를 즐길 수 있다 (광고 실패 시에도 풀이는 막히지 않는다) — v1.0
- ✓ 풀이 결과를 토스 공유 시트로 외부에 공유할 수 있다 — v1.0
- ✓ Toss `getAnonymousKey()` 기반 익명 식별과 Firebase 사용자 행동 분석이 작동한다 — v1.0

<!-- v1.1 (복냥타로 통합) — Shipped 2026-05-05 -->
- ✓ 사용자가 앱 하단 탭바에서 "사주"와 "타로"를 한 번의 탭으로 전환할 수 있다 — v1.1 (NAV-01/02/03)
- ✓ 사용자가 타로 탭에서 데일리 원카드("오늘의 한 장")를 뽑고 카드 이미지·이름·해석을 한 화면에서 확인할 수 있다 — v1.1 (TAROT-01/02/03)
- ✓ 같은 날 재진입 시 그날 뽑은 카드가 다시 표시되고, KST 자정에 lock 이 해제되며, 새로고침/앱 재시작에도 유지된다 — v1.1 (DAILY-01/02/03)
- ✓ 사용자가 데일리 원카드 결과를 토스 공유 시트로 외부에 공유할 수 있다 — v1.1 (SHARE-01)
- ✓ 타로 탭 진입·카드 뽑기·공유 3종 이벤트가 Firebase Analytics에 기록된다 — v1.1 (ANL-01/02/03)

### Active

<!-- v1.2 마일스톤 — 다음 마일스톤은 `/gsd-new-milestone` 으로 정의. 현재는 시드만 parking 상태. -->

(다음 마일스톤 미정의 — `/gsd-new-milestone` 으로 시작)

### Out of Scope

<!-- 이번 마일스톤 의도적으로 제외 — 추후 별도 마일스톤 후보 -->

- 광고 기반 수익화 (AdMob 보상형 등) — v1.1 daily-one-card 는 한계 비용 0, 광고 도입 정당성 없음. LLM 기능 도입 시점(v1.2+)에 재검토.
- 22장 컬렉션 메타게임 (기록 탭, 진행률, 보상) — v1.2 retention 후크 후보 (`.planning/seeds/22-card-collection-meta-game.md`)
- LLM 기반 고민상담 / 3-card 스프레드 — LLM 비용 발생 → 수익화 모델과 함께 v1.2+ 도입 (`.planning/seeds/llm-features-and-monetization.md`)
- 주제별 타로 리딩 (연애/금전/취업) — 데일리 원카드 통합 후 별도 마일스톤에서 검토
- 스프레드(3장/5장 등 다수 카드) 리딩 — 동일, 다음 마일스톤 후보
- 타로 유료 상품(타로 부적/굿즈, 딥리딩 결제) — daily 정착 후 cross-sell 기획
- 사주 ↔ 타로 데이터 통합(예: 사주 입력값으로 타로 해석 보정) — 별도 통합 단계에서 검토
- 회원 시스템/계정 관리 — 토스 익명키 + 토스 로그인(부적 결제용) 외에 자체 회원 도입 안 함

## Context

**기술 환경:**
- Apps-in-Toss 웹앱(`@apps-in-toss/web-framework` 2.4.5) — 토스 네이티브 브리지(IAP, GoogleAdMob, Camera, Album, Analytics, Storage)에 의존
- React 18 + Vite 5 SPA, React Router DOM 7로 라우트 분기 (`/`, `/saju`, `/new-year`, `/amulet`)
- Toss TDS Mobile (`@toss/tds-mobile`, `@toss/tds-mobile-ait`) + Emotion 디자인 시스템
- 데이터: Supabase 2.86 (메뉴 테이블 `ai_saju_types`, `new_year_fortune_types`, `saju_reading_types`, `amulet_types`, 결제 `amulet_orders`)
- 외부 AI: 사주/딥리딩 API (`saju.trinity-apps.net`, dev: `192.168.0.28:8000`)
- 관측: Firebase Analytics, Sentry (production)
- 빌드 산출물: `fortune-cat.ait` (Apps-in-Toss 패키지)

**기존 자산을 활용하는 통합:**
- 복냥타로는 이미 다른 로컬 레포지토리에 **완성된 프로토타입**으로 존재 — 이번 마일스톤은 0→1이 아니라 포팅·정리·탭 통합
- 프로토타입 정확한 경로는 마일스톤 진입 시점에 사용자가 제공 예정
- 광고/공유/Anonymous Key/이벤트 로깅은 v1.0의 Loading/Result 패턴을 그대로 재사용 가능

**주 사용자(4050 여성)에 대한 합의:**
- 작은 글씨/복잡한 입력을 회피해야 함 — 텍스트 사이즈와 탭바 hit area를 보수적으로 설계
- 한 번에 한 가지 작업만 노출되는 흐름이 친숙 — "데일리 원카드"의 단일 카드 경험과 잘 맞음

**알려진 정리 필요 사항(코드베이스 매핑에서):**
- `pnpm-lock.yaml` + `package-lock.json` 동시 존재 — 패키지 매니저 일원화 필요(우선순위 낮음)
- 일부 컴포넌트 파일 권한 600 — 기능 무관, 정리 권장
- 일부 디렉토리에 `.DS_Store` 잔존 — `.gitignore` 보강 권장

## Constraints

- **Tech stack**: React 18 + Vite + TDS Mobile/AIT + Apps-in-Toss web-framework — 토스인앱 배포 정책 및 디자인 일관성을 위해 변경 불가
- **Platform**: Apps-in-Toss WebView — 일반 브라우저에서는 광고/IAP/GetAnonymousKey가 동작하지 않음, dev에서는 graceful degradation 필요
- **Auth**: 자체 회원 시스템 없음 — 익명키(Toss `getAnonymousKey`) + 결제 시 토스 로그인(`@apps-in-toss/web-framework`)만 사용
- **Data**: 단일 Supabase 프로젝트(현 saju.trinity-apps.net 백엔드와 동일) — 타로 메뉴/카드도 같은 프로젝트에 추가
- **Monetization (v1.1)**: 타로는 **데일리 무료 (광고 0, 결제 0)** — 한계 비용 0인 정적 콘텐츠. 수익화는 LLM 기능 도입 시점(v1.2+)에 재검토.
- **Build**: AIT 빌드 산출물(`fortune-cat.ait`) 호환 유지 — `granite.config.ts` 권한 변경 시 토스 심사 영향 검토
- **Repository layout**: `app-in-toss/` 멀티앱 모노레포 — git는 부모 디렉토리에서 관리, `fortune-cat/` 작업 시 형제 앱(예: `ai-pet-studio`)에 영향 주지 않도록 주의

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 타로를 **하단 탭바 + `/tarot` 라우트**로 통합 | 4050 여성 사용자에게 단일 진입점·전환을 직관적으로 제공. Phase 2 진입 시 URL 명확성·딥링크 확장성을 위해 `/tarot` 라우트를 신규 추가하기로 재결정 (Phase 2 D-01) — 단, 라우트 안에서는 `currentPage` 상태 머신으로 단계 전환 (Phase 1 D-10 carry-forward) | Validated in Phase 2 (탭바 셸 + `/tarot` 라우트 도입 완료) |
| v1.1 타로 수익 모델 = **데일리 lock 무료 (광고 0, 결제 0)** | 한계 비용 0 + 4050 사용자에게 광고 피로 회피 + 자정 리셋이 매일 재방문 후크. (2026-05-03 광고 무제한 → daily-lock 무료로 전환) | ✓ Good — v1.1 출시. v1.2 LLM 기능 도입 시 재검토 |
| 타로 v1.1 콘텐츠를 **데일리 원카드 1종**으로 한정 | 작게 출시·검증 → 주제별 리딩/스프레드는 다음 마일스톤 분기 | ✓ Good — v1.1 출시. retention 데이터 보고 v1.2 확장 결정 |
| 다른 레포의 **프로토타입을 포팅**하여 통합 | 기획·디자인이 이미 검증되어 있어 0→1 비용을 회피 | ✓ Good — boknyang-tarot 자산 인벤토리 + 갭 매트릭스로 5 phases 4일 만에 완료 |
| Supabase·Firebase·Sentry·AdMob **기존 인프라 재사용** | 추가 운영 비용·심사 부담을 최소화 | ✓ Good — 신규 npm 의존성 0 (D-02 carry), v1.0 회귀 0 |
| (v1.1 추가) **TAROT-03 의미 변경: '다시 뽑기' → '처음으로'** | 데일리 lock 도입으로 redraw 무의미 → intro 복귀 액션으로 의미 변경 (2026-05-03) | ✓ Good — Phase 04/05 전반 검증 통과 |
| (v1.1 추가) **REVIEW WR-01 fix: tarot_view 중복 발화 차단 (useRef 가드)** | saveTodayDraw 후 todayDraw reference 변경에 의한 중복 발화 가능성 | ✓ Good — Phase 5 fix 적용, UAT § 4 검증 통과 |

## Current State

**Shipped:** v1.1 복냥타로 통합 (별도 탭) — 2026-05-05
- 5 phases, 8 plans, 11 tasks, 35 files (+1,713 / -9 lines), 4 days
- 13/13 v1.1 requirements satisfied
- v1.0 회귀 0 (브라운필드 자산 무수정)
- 신규 npm 의존성 0건

**Known Gaps (출시 후 보완 — 자세한 내용은 [MILESTONES.md](./MILESTONES.md)):**
- Phase 03 VERIFICATION.md 미생성 — implicit pass via Phase 04/05
- UAT-04-8 손상 데이터 자동 복구 1건 미수행
- UAT § 5 선택 항목 03-C/03-D 미수행
- OG 이미지 캐시 갱신 (기능 영향 없음, accept)

## Next Milestone: v1.2 (planned)

**시작:** `/gsd-new-milestone` 호출로 questioning → research → requirements → roadmap 정의

**시드(parked, v1.1 출시 후 데이터 보고 우선순위 결정):**
- 22장 카드 컬렉션 메타게임 — 장기 retention 후크 (`.planning/seeds/22-card-collection-meta-game.md`)
- LLM 기반 기능 + 수익화 — 고민상담 / 3-card 스프레드 + 결제·광고 게이팅 (`.planning/seeds/llm-features-and-monetization.md`)
- 타로 카드 이미지 디바이스 저장 (`.planning/seeds/tarot-image-save.md`)

**측정 지표 (v1.1 출시 후 4주):**
- daily lock retention (DAU 재방문율)
- card_drawn vs card_shared 비율 (공유 후크 가치)
- 22일 시점 누적 사용자 (컬렉션 메타게임 도입 타이밍)

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-05 — v1.1 milestone 복냥타로 통합 (별도 탭) 출시 archive.*
