# Milestones

## v1.1 복냥타로 통합 (별도 탭) (Shipped: 2026-05-05)

**Goal:** 데일리 원카드 타로 경험을 하단 탭바 형태로 복냥사주에 통합해, 4050 여성 사용자의 재방문과 체류를 늘린다.

**Stats:**
- Phases: 5 (8 plans, 11 tasks)
- Code: 35 files changed (+1,713 / -9 lines)
- Timeline: 2026-05-01 → 2026-05-05 (5 days)
- Quick tasks: 2 (260504-f2q HomePage 헤더, 260504-gbj 모달 + 여백)

**Key Accomplishments:**

1. **Phase 1 — 프로토타입 평가:** boknyang-tarot 자산 인벤토리 + 의존성 갭 매트릭스 (Tailwind→Emotion / zustand→Context / Radix→TDS / TS→JSX / TanStack→React Router)
2. **Phase 2 — 탭바 셸 (NAV-01/02/03):** React Router 기반 사주/타로 2탭 하단 셸 + `/tarot` 라우트 + outer-shell 통합. v1.0 5개 라우트 회귀 0
3. **Phase 3 — 타로 코어 (TAROT-01/02/03):** Supabase `tarot_cards` 마이그레이션 + 22장 webp 정적 import + 3개 컴포넌트(TarotCardArt / TarotShuffle / TarotResult) + 3단계 상태 머신
4. **Phase 4 — 데일리 lock (DAILY-01/02/03):** `useTodayDrawStorage` 훅 + Asia/Seoul `todayKST()` 헬퍼 + TarotPage 통합. 같은 날 result 직진 / 자정 reset / 새로고침 영속성
5. **Phase 5 — 공유 + Analytics (SHARE-01, ANL-01/02/03):** 토스 공유 시트 실구현 + Firebase 3종 이벤트 + 브랜딩 `복냥사주&타로` 통합
6. **Quick fixes (260504):** HomePage 헤더 통합 / TarotResult 하단 버튼 여백 / 카드 이미지 확대 모달 (x · 백드롭 · ESC 3종 닫기 + a11y dialog)

**Requirements:** 13/13 satisfied (NAV·TAROT·DAILY·SHARE·ANL 전 영역)

**Verification:** Phase 02/04/05 자동 검증 통과 + 인간 UAT 21/22 trackable + 2/4 선택 추가 통과

### Known Gaps (출시 후 보완)

- **Phase 03 VERIFICATION.md 미생성** — `03-VALIDATION.md` status=draft, nyquist_compliant=false. Phase 04/05 검증에서 코드 wiring implicit 카버됨. v1.2+ 자체 테스트 인프라(vitest/jest) 도입 시 일괄 보완 권장.
- **UAT-04-8 손상 데이터 자동 복구** — DevTools Storage 변조 시나리오 1건 미수행. 코드 가드(JSON.parse try/catch + 복구) 는 검증됨. 실제 변조 케이스는 운영 후 재현 시 추적.
- **UAT § 5 선택 항목 2/4 미수행** — 03-C (DevTools Offline fetch 실패 동선) / 03-D (Sentry 대시보드 PII 미포함 확인). v1.2 자체 테스트 인프라에서 자동화 후보.
- **OG 이미지 캐시 갱신** — Supabase Storage `menu_images/og_image.png` 교체 후 토스 측 단축링크 캐시가 옛 이미지 반환 가능. v1.1 accept (기능 영향 없음). 필요 시 cache-busting 쿼리스트링 도입.
- **타로 카드 이미지 디바이스 저장** — 사용자 요청. v1.2 후보로 parking (`.planning/seeds/tarot-image-save.md`).
- **Nyquist 자동 테스트 미도입** — Phase 03 VALIDATION.md 만 부분 정의. 0/5 phase 가 vitest/jest 인프라. v1.2+ 도입 권장.

### v1.1 Retrospective (요약)

- **Worked:** v1.0 검증 패턴 재사용(useUserInfoStorage→useTodayDrawStorage / HomePage 공유 → TarotPage 공유), 신규 npm 의존성 0건 유지(D-02 carry), 브라운필드 회귀 0
- **Inefficient:** Phase 03 verification 정식 절차 누락 (post-hoc implicit pass 처리), REQUIREMENTS.md 체크박스 작업 진행 중 미갱신 (archive 시 일괄 처리됨)
- **Lessons:** quick task 흐름이 UAT 발견 이슈에 빠르게 대응 가능 (260504-gbj 모달 추가는 디바이스 검증 직후 fix)

---
