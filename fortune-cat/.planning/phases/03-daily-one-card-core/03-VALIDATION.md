---
phase: 3
slug: daily-one-card-core
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-05-02
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> 본 페이즈는 자동 테스트 인프라 미도입 (RESEARCH §Validation Architecture 결정) — ESLint + Vite build + UI-SPEC Checker + 수동 디바이스 검증으로 보호한다.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | 자동 단위/통합 테스트 미구성 (vitest/jest 미설치, Phase 3 outscope — D-02 신규 의존성 금지 carry-forward) |
| **Config file** | none — `eslint.config.js` (lint), `vite.config.js` (build) |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint && npm run build` |
| **Estimated runtime** | ~15초 (lint) / ~30초 (build 포함) |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint`
- **After every plan wave:** Run `npm run lint && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green + UI-SPEC Checker Sign-Off + 수동 디바이스 1순회
- **Max feedback latency:** 30초

---

## Per-Task Verification Map

| Req ID | Behavior | Test Type | Automated Command | Status |
|--------|----------|-----------|-------------------|--------|
| TAROT-01 | intro → shuffle 부채꼴 → 1장 탭 → 뒤집기 → result 진입 | manual + lint | `npm run lint && npm run build` | ⬜ pending |
| TAROT-01 | 22장 fetch 성공 시 부채꼴 3장 노출 | manual (Vite dev) | `npm run dev` 후 `/tarot` 진입 | ⬜ pending |
| TAROT-01 | 22장 fetch 실패 시 에러 화면 + 재시도 버튼 | manual (네트워크 차단) | — | ⬜ pending |
| TAROT-02 | 결과 화면에 카드 이미지·이름·해석 동시 표시 | manual + UI-SPEC Checker | (UI-SPEC 시각 검수) | ⬜ pending |
| TAROT-02 | 4050 가독성: 본문 16px / line-height 1.6 / WCAG AA contrast | manual + UI-SPEC Checker | (UI-SPEC Checker Sign-Off) | ⬜ pending |
| TAROT-03 | 다시 뽑기 클릭 → shuffle 새 3장 | manual | `npm run dev` 후 다시 뽑기 5회 (다른 카드 노출) | ⬜ pending |
| TAROT-03 | 다시 뽑기 버튼이 탭바 가리지 않음 | manual + UI-SPEC | (UI-SPEC §Spacing exception) | ⬜ pending |
| (D-10) | fetch 에러 시 `Sentry.captureException` 호출 | manual (Sentry dashboard) | — | ⬜ pending |
| (D-02) | 카드 뒤집기 60fps (jank 없음) | manual (Chrome DevTools Performance) | — | ⬜ pending |
| (D-09) | intro fetch 진행 중 `<Loader />` 노출 | manual + lint | `npm run dev` slow network throttling | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] **None — 본 페이즈는 신규 테스트 인프라 도입 안 함 (RESEARCH §Wave 0 Gaps 결정)**

본 페이즈가 갖춘 보호장치:
- ESLint(react-hooks·react-refresh) → useEffect cleanup 누락·hook 룰 위반 감지
- Vite production build → import 누락·circular dep·번들 크기 회귀 감지
- UI-SPEC Checker (03-UI-SPEC.md Checker Sign-Off 6 dimensions) → 시각·copy·color·typography·spacing·registry 자동 검수
- Sentry production runtime → 실배포 후 fetch 실패·rendering 에러 자동 수집

**미도입 결정 근거:** (1) Phase 3 CONTEXT/Discretion 모두 언급 없음, (2) D-02 신규 의존성 금지 carry-forward, (3) v1.0 코드도 자동 테스트 없이 운영 중 — 본 페이즈만 도입은 비대칭. 향후 마일스톤에서 v1.0 + v1.1 통합 테스트 마이그레이션 시 통째로 도입 권장.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 카드 뒤집기 애니메이션 60fps | (D-02) 신규 라이브러리 금지·CSS 3D | DOM 측정 자동화 인프라 부재 | Chrome DevTools Performance 녹화 → 16ms/frame 이내 |
| 4050 여성 가독성 (text size, contrast) | TAROT-02 | 인지·주관 평가 영역 | 실기기에서 읽기 + UI-SPEC §Typography/§Color contrast 시각 검수 |
| 22장 fetch 실패 → 에러 화면 + 재시도 | TAROT-01 (D-10) | 네트워크 모킹 인프라 부재 | DevTools Network throttling Offline → `/tarot` 진입 → 에러 + 재시도 버튼 → 복구 |
| Sentry 에러 캡처 | (D-10) | dashboard 외부 시스템 | 강제 에러 발생 후 Sentry 프로젝트 dashboard에 이벤트 도착 확인 |
| 다시 뽑기 5회 reshuffle | TAROT-03 | 시각 확인 필요 | 다시 뽑기 5회 → 매번 부채꼴 새 3장 + 결과 카드 변화 |
| 탭바 미가림 | TAROT-03 | 시각 확인 필요 | 결과 화면 스크롤 끝 + sticky 다시 뽑기 버튼이 탭바와 안 겹침 |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (lint/build) or are flagged `manual`
- [ ] Sampling continuity: lint/build runs after every task and wave
- [ ] Wave 0 covers all MISSING references (없음 — 본 페이즈 미도입)
- [ ] No watch-mode flags in commands
- [ ] Feedback latency < 30s (lint) / < 30s (build)
- [ ] UI-SPEC Checker Sign-Off 6 dimensions 통과
- [ ] 수동 디바이스 검증 1순회 완료 (`/tarot` intro→shuffle→flip→result→다시뽑기 5회)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
