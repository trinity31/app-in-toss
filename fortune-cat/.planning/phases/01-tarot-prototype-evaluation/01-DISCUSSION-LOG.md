# Phase 1: 타로 프로토타입 발굴 및 포팅 평가 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-04-30
**Phase:** 01-tarot-prototype-evaluation
**Areas discussed:** 프로토타입 출처+인벤토리, 카드 자산 보관 위치, 포팅 전략

---

## 영역 선택 (Multi-select)

| Option | Description | Selected |
|--------|-------------|----------|
| 프로토타입 출처 확정 + 자산 인벤토리 | 두 후보(boknyang-tarot, fortune-cat-tarot) 중 정본 확정 + 가져올 자산 범위 | ✓ |
| 카드 자산 보관 위치 | 22장 이미지 + 해석 텍스트 보관 위치 (Supabase Storage / public / 정적 / 테이블) | ✓ |
| 포팅 전략 — 그대로 vs 재구현 | 의존성·라우팅 충돌 처리 전략 | ✓ |
| Phase 1 산출물 형태 | 단일 보고서 / 인벤토리+갭 분리 / ADR | (선택 안 함 — Claude 재량으로 결정, D-05 참조) |

---

## 영역 1: 프로토타입 출처 + 인벤토리

### Q1: Phase 1의 정본 프로토타입으로 어느 레포를 사용할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| boknyang-tarot (추천) | TDS Mobile/AIT, React 18, granite/ait 빌드 — fortune-cat과 동일 스택 | ✓ |
| fortune-cat-tarot | TanStack Start, React 19, Cloudflare — 스택 적합도 낮음 | |
| 둘 다 사용 | boknyang-tarot 베이스 + fortune-cat-tarot 디자인/문구 참고 | |
| 다른 경로 제공 | 위 두 후보 외 | |

**User's choice:** boknyang-tarot (추천)
**Notes:** fortune-cat과의 스택 호환성이 핵심 결정 이유. 정본 경로는 `/Users/trinity/Projects/toss-app-generator/workspace/boknyang-tarot/boknyang-tarot/`.

---

### Q2: Phase 1 자산 인벤토리에 어디까지 포함할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 데일리 원카드 핵심만 | index/shuffle/result + TarotCardArt + 데이터/이미지 | |
| 데일리 원카드 + 탭바 관련 자산 (추천) | 위 + BottomNav, 그 외는 명시적 out-of-scope | ✓ |
| 전체 평가 | archive/Particles/RatingWidget/Boknyang 포함 | |

**User's choice:** 데일리 원카드 + 탭바 관련 자산 (추천)
**Notes:** Phase 2(탭바 셸)에서 BottomNav가 참고가 될 가능성을 고려. archive 등은 차기 마일스톤 후보로 인벤토리에 "Reviewed but excluded"로 기록.

---

### Q3: 평가의 깊이는 어느 수준이 적당할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 자산 목록 + 갭 매트릭스 (추천) | 자산 인벤토리 표 + 스택/의존성/라우팅 갭 매트릭스 | ✓ |
| + 컴포넌트별 매핑 표까지 | 위 + 1:1 컴포넌트 매핑 | |
| + ADR을 포함한 완전한 결정 기록 | 위 + 주요 아키텍처 결정 ADR | |

**User's choice:** 자산 목록 + 갭 매트릭스 (추천)
**Notes:** 컴포넌트별 매핑·ADR은 Phase 2~5에서 필요 시점에 결정.

---

## 영역 2: 카드 자산 보관 위치

### Q4: 카드 이미지 22장을 어디에 보관할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| src/assets/images/cards/ 정적 임포트 (추천) | fortune-cat 풀이 일러스트 패턴과 동일, 번들 포함 | ✓ |
| Supabase Storage | 부적 이미지 패턴, 운영 중 교체 가능, prefetch 필요 | |
| public/cards/ 정적 파일 | 임포트 불필요, 그러나 fortune-cat 패턴과 불일치 | |

**User's choice:** src/assets/images/cards/ 정적 임포트 (추천)
**Notes:** 22장 합 ~1MB. 카드 뒤집기 UX 보장을 위해 초기 번들 포함이 안전.

---

### Q5: 카드 해석 텍스트(이름/키워드/메시지)는 어디에 둘까요?

| Option | Description | Selected |
|--------|-------------|----------|
| Supabase 테이블 (추천) | fortune-cat 메뉴 테이블 패턴(`ai_saju_types` 등)과 일관, 운영 중 수정 가능 | ✓ |
| src/data/cards.js 정적 데이터 | 프로토타입 cards.ts를 JSX로 변환, 네트워크 0회 | |
| 조합 — 정적 기본 + 서버 오버라이드 | 정적 fallback + Supabase 우선 | |

**User's choice:** Supabase 테이블 (추천)
**Notes:** 시즌 콘텐츠 변경 가능성 + 향후 주제별/스프레드 확장 시 같은 모델로 확장. `tarot_cards` 테이블, 권장 컬럼: `id, name_ko, name_en, emoji, image_path, keywords[], message`. 정확한 스키마는 Phase 3에서 확정.

---

## 영역 3: 포팅 전략 — 그대로 vs 재구현

### Q6: 프로토타입 의존성(Tailwind, zustand, Radix, framer-motion, TS 등)을 어떻게 다룰까요?

| Option | Description | Selected |
|--------|-------------|----------|
| fortune-cat 패턴으로 전면 재구현 (추천) | Tailwind→Emotion, zustand→Context, Radix→TDS, TS→JS | ✓ |
| 하이브리드 — 임포트 가능한 건 그대로 | 인터랙션 핵심만 선별 도입(framer-motion 등) | |
| 프로토타입 그대로 + fortune-cat을 맞춤 | 의존성 추가, AIT 심사·번들 리스크 | |

**User's choice:** fortune-cat 패턴으로 전면 재구현 (추천)
**Notes:** PROJECT.md 제약(TDS Mobile/AIT 스택 변경 불가) 준수. framer-motion은 Phase 2/3에서 별도 평가 (D-09).

---

### Q7: 프로토타입의 4개 라우트(index/shuffle/result/archive)를 fortune-cat에 어떻게 통합할까요?

| Option | Description | Selected |
|--------|-------------|----------|
| 단일 상태 머신 멀티스텍 페이지 (추천) | SajuPage/AmuletPage의 currentPage 패턴, archive out-of-scope | ✓ |
| 몇 개만 독립 라우트 | /tarot, /tarot/result 등 — PROJECT.md 제약과 충돌 | |
| Phase 1에서는 명시적 결정 보류 | Phase 2/3에서 결정 | |

**User's choice:** 단일 상태 머신 멀티스텍 페이지 (추천)
**Notes:** PROJECT.md "별도 /tarot 라우트 추가 금지" 제약과 일치. archive는 out-of-scope.

---

## Claude's Discretion

다음 항목은 사용자 결정 없이 Claude의 재량으로 진행됩니다 (CONTEXT.md `Claude's Discretion` 섹션 참조).

- 자산 인벤토리 표·갭 매트릭스의 마크다운 컬럼 구조와 행 배열.
- 인벤토리·갭 매트릭스를 단일 문서에 둘지, 두 문서로 분리할지의 미세 구조.
- `boknyang-tarot` 코드를 깊이 읽어가며 발견되는 추가 충돌 항목의 매트릭스 등재 기준.
- 카드 이미지의 파일 권한·정렬·확장자(WebP 변환 검토 권장 여부).

## Deferred Ideas

논의 중 언급되었거나 명시적으로 out-of-scope된 항목들. CONTEXT.md `<deferred>` 섹션 참조.

- archive 라우트 (다음 마일스톤 후보)
- RatingWidget / Particles / Boknyang 마스코트 (마일스톤·브랜드 검토 필요)
- framer-motion 도입 여부 (Phase 2/3에서 결정)
- `tarot_cards` 정확한 스키마 (Phase 3에서 확정)
- 카드 이미지 포맷·압축 수준 (Phase 3에서 결정)
- 주제별/스프레드/유료 타로 (PROJECT.md Out of Scope, REQUIREMENTS.md Future)
- pnpm/npm lockfile 일원화, .DS_Store 정리 (마일스톤 내 옵션, 우선순위 낮음)
