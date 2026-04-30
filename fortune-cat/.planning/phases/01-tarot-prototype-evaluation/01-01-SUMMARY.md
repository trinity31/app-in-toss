---
phase: 01-tarot-prototype-evaluation
plan: 01
subsystem: planning/evaluation
tags: [tarot, evaluation, porting, inventory, gap-matrix]
dependency_graph:
  requires:
    - .planning/phases/01-tarot-prototype-evaluation/01-CONTEXT.md
    - boknyang-tarot 프로토타입 (외부 워크스페이스)
  provides:
    - .planning/phases/01-tarot-prototype-evaluation/01-INVENTORY.md
    - .planning/phases/01-tarot-prototype-evaluation/01-GAPS.md
  affects:
    - Phase 2 (탭바 셸)
    - Phase 3 (데일리 원카드 코어)
    - Phase 5 (Analytics·공유)
tech-stack:
  added: []  # 평가/문서화 페이즈 — 신규 의존성 없음
  patterns:
    - "외부 프로토타입 자산 → fortune-cat 통합 지점 1:1 매핑 표"
    - "충돌 강도 색상 분류(🔴/🟡/🟢) + D-XX 트레이서빌리티"
key-files:
  created:
    - .planning/phases/01-tarot-prototype-evaluation/01-INVENTORY.md
    - .planning/phases/01-tarot-prototype-evaluation/01-GAPS.md
  modified: []
decisions:
  - "카드 데이터 22장 = Supabase `tarot_cards` 테이블 (D-07) — 정적 import 미사용"
  - "카드 이미지 22장 = `src/assets/images/cards/` 정적 임포트 (D-06) — 단, 실제 형식은 .webp이므로 Phase 3에서 PNG 변환 여부 결정"
  - "라우팅 = `TarotPage.jsx` 단일 라우트 + `currentPage` 상태 머신 (D-10) — 별도 `/tarot` 추가 안 함"
  - "신규 의존성 추가 없음 (D-08) — Tailwind→Emotion, zustand→Context, Radix→TDS, TS→JSX, TanStack→React Router, framer-motion만 D-09 미결"
metrics:
  duration: ~30min
  completed_date: "2026-04-30"
  tasks_completed: 2
  artifacts_count: 2
  inventory_lines: 122
  gaps_lines: 91
---

# Phase 1 Plan 1: boknyang-tarot 자산 인벤토리 + 포팅 갭 매트릭스 Summary

**One-liner:** boknyang-tarot 프로토타입의 자산(라우트 5·컴포넌트 5·데이터 1·라이브러리 5·카드 22장)을 인벤토리화하고 fortune-cat 측 5종 의존성 충돌(Tailwind→Emotion, zustand→Context, Radix→TDS, TS→JSX, TanStack→React Router) + framer-motion 미결정을 색상별 갭 매트릭스로 정리했다.

---

## Outputs

| 파일 | 라인 수 | 역할 |
|------|---------|------|
| `.planning/phases/01-tarot-prototype-evaluation/01-INVENTORY.md` | 122 | 자산 인벤토리 — 5개 H3 서브섹션(라우트/컴포넌트/데이터/라이브러리/카드 이미지) + In-scope·Reviewed but excluded 요약 + 대응 fortune-cat 통합 지점 |
| `.planning/phases/01-tarot-prototype-evaluation/01-GAPS.md` | 91 | 갭 매트릭스 — 9개 충돌 영역(필수 6 + 추가 3) × 강도 표시 + 충돌 강도 요약 + 신규 의존성 정책 + 후속 페이즈 영향 |

### 인벤토리 행 수 (총 38행)

- 라우트 5행 (`__root`/`index`/`shuffle`/`result`/`archive`)
- 컴포넌트 5행 (`TarotCardArt`/`BottomNav`/`Boknyang`/`RatingWidget`/`Particles`)
- 데이터 1행 (`cards.ts`)
- 라이브러리/스토어 5행 (`store/tarot.ts`/`utils.ts`/`ratings.ts`/`session.ts`/`track.ts`)
- 카드 이미지 22행 (`00.webp ~ 21.webp`)

### 갭 매트릭스 행 수 (총 9행)

- 필수 6행 (라우팅·스타일링·상태 관리·UI 프리미티브·언어·모션)
- 추가 3행 (카드 데이터 위치·카드 이미지 형식·AIT 빌드 설정) — Task 1 인벤토리 작성 중 발견되어 추가

---

## Success Criteria 충족 (Phase 1 ROADMAP)

| # | 기준 | 상태 |
|---|------|------|
| 1 | 사용자가 INVENTORY.md에서 프로토타입 핵심 자산(카드 이미지·해석 데이터·인터랙션 코드) 위치를 표 형태로 확인 가능 | ✅ 5개 H3 서브섹션 + 22장 카드 이미지 표 |
| 2 | 포팅 대상(in-scope)과 제외 대상(out-of-scope)을 명확히 구분 | ✅ 모든 표 행에 `In/Out-of-scope` 컬럼 + `## In-scope vs Out-of-scope 요약` 섹션 + Reviewed but excluded 7항목 |
| 3 | fortune-cat 디자인 시스템·의존성·라우팅 충돌 항목을 5종(+framer-motion 미결정) 강도 표시와 함께 확인 | ✅ 갭 매트릭스 9행, 🔴 1건/🟡 5건/🟢 3건 |
| 4 | 카드 이미지 보관 위치(`src/assets/images/cards/`) + 해석 텍스트 보관 위치(Supabase `tarot_cards`)가 인벤토리 '대응 fortune-cat 위치' 컬럼에 반영 | ✅ 22행 모두 `src/assets/images/cards/{id}.webp` 명시, 데이터 행에 Supabase `tarot_cards` 명시 |

---

## Key Decisions (D-XX 트레이서빌리티)

| Decision | 산출물 반영 위치 |
|----------|------------------|
| D-01 (boknyang-tarot 정본) | INVENTORY 헤더 `Source prototype` |
| D-03 (in-scope 라우트 3 + 컴포넌트 2 + 데이터 1) | INVENTORY 라우트/컴포넌트/데이터 표의 `In-scope` 행 |
| D-04 (Reviewed but excluded 4항목) | INVENTORY `### Reviewed but excluded` 섹션에 7항목(D-04 4항목 + 라이브러리 3항목) |
| D-06 (이미지 = `src/assets/images/cards/` 정적 임포트) | INVENTORY 카드 이미지 표 22행 모두 `대응 fortune-cat 위치` 컬럼 |
| D-07 (텍스트 = Supabase `tarot_cards`) | INVENTORY 데이터 행 + GAPS 카드 데이터 위치 행 |
| D-08 (신규 의존성 없음 + 5종 재구현) | GAPS 갭 매트릭스 5종 행 + `## 신규 의존성 정책` 섹션 |
| D-09 (framer-motion 보류) | GAPS 모션 행 + `## 충돌 강도 요약 → 🟢` |
| D-10 (`currentPage` 상태 머신) | INVENTORY 라우트 표 In-scope 3행 + GAPS 라우팅 행 |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Sources] D-06 가정(`.png`)과 실제 형식(`.webp`) 불일치 발견**

- **Found during:** Task 1 (`ls public/cards/` 실행 시점)
- **Issue:** CONTEXT.md D-06과 PROJECT.md `tarot v1.1` 노트는 카드 이미지 형식을 `.png`로 가정했으나, 실제 boknyang-tarot 프로토타입의 `public/cards/`에는 `00.webp ~ 21.webp` (WebP)가 들어 있었다 (`cards.ts`의 `img(id) = /cards/${id}.webp`도 일치).
- **Fix (산출물 한정):**
  - INVENTORY 카드 이미지 표의 `실제 형식` 컬럼에 모두 "WebP"를 명시.
  - 표 위 명시 박스에 "CONTEXT.md D-06은 `.png`로 가정했으나 실제 프로토타입은 `.webp` 형식이다. Phase 3 자산 복사 시 PNG 변환 여부는 별도 결정 (CONTEXT deferred 항목 참조)" 안내 추가.
  - GAPS 매트릭스에 "카드 이미지 형식" 행을 🟢 강도로 추가 (WebP 유지 vs PNG 변환 트레이드오프).
- **Files modified:** 산출물 2개 (`01-INVENTORY.md`, `01-GAPS.md`) — 코드 변경 없음.
- **Commit:** Task 1 (1ddfaeb), Task 2 (d427f4a) — 두 산출물 모두에 반영.
- **Why this is Rule 1 not Rule 4:** 사실 관계 정정(가정 vs 실제 차이의 명시)이며 아키텍처 변경이 아님. Phase 3 결정 사항으로 deferred 처리 — 본 페이즈에서는 정정·문서화만 수행.

**2. [Rule 2 - Completeness] 갭 매트릭스에 추가 충돌 영역 3개 자체 발견**

- **Found during:** Task 2 작성 중 (Task 1 인벤토리에서 도출)
- **Issue:** 플랜이 6개 필수 행 + "선택 추가 행"을 허용했으며, 인벤토리 작성 중 다음 3개 추가 충돌 영역을 발견:
  - 카드 데이터 위치 (정적 `cards.ts` → Supabase `tarot_cards`) — D-07 인용, 강도 🟡.
  - 카드 이미지 형식 (.webp vs .png) — Phase 3 결정, 강도 🟢.
  - AIT 빌드 설정 (`granite.config.ts` 차이) — fortune-cat 변경 없음, 강도 🟢.
- **Fix:** 갭 매트릭스 본 표에 3행 추가, `## 충돌 강도 요약`에 분류 반영.
- **Files modified:** `01-GAPS.md` (산출물 한정).
- **Commit:** d427f4a.

추가 deviation은 없음.

---

## Self-Check: PASSED

**검증 명령 실행 결과:**

```
INVENTORY OK   (122 lines, all D-XX/keywords/22 cards verified)
GAPS OK        (91 lines, all D-XX/keywords/icons verified)
```

**커밋 검증:**
- 1ddfaeb: `docs(01-01): add boknyang-tarot 자산 인벤토리 (Phase 1 산출물 1/2)` — FOUND
- d427f4a: `docs(01-01): add 포팅 갭 매트릭스 (Phase 1 산출물 2/2)` — FOUND

**파일 검증:**
- `.planning/phases/01-tarot-prototype-evaluation/01-INVENTORY.md` — FOUND
- `.planning/phases/01-tarot-prototype-evaluation/01-GAPS.md` — FOUND

---

## Threat Flags

(없음 — 평가/문서화 전용 페이즈로 새로운 보안 surface가 도입되지 않음. T-01-01~T-01-03 모두 plan 기록대로 처리.)

---

## Notes for Downstream Phases (2~5)

후속 페이즈 플래너에게 전달할 핵심 메시지 3줄:

1. **`01-INVENTORY.md`의 `대응 fortune-cat 위치` 컬럼이 신규 코드 위치의 단일 진실 소스다** — `src/pages/TarotPage.jsx`(D-10), `src/assets/images/cards/`(D-06), Supabase `tarot_cards`(D-07), `src/components/TarotCardArt.jsx`(D-08).
2. **`01-GAPS.md`의 🔴 라우팅 충돌은 Phase 2/3 시작 전 반드시 합의 완료해야 하며**, 🟡 5건은 fortune-cat 기존 의존성으로 재구현(D-08 — 신규 의존성 추가 없음). 🟢 모션은 Phase 2/3에서 TDS 기본 트랜지션 우선 검토 후 결정(D-09).
3. **카드 이미지 형식은 `.webp`(실제) vs `.png`(D-06 가정) 결정이 필요하다** — Phase 3 자산 복사 시점에 WebP 유지(파일 크기) vs PNG 변환(기존 형식 일관성) 중 선택.
