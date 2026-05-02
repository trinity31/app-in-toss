---
phase: 03-daily-one-card-core
plan: "01"
subsystem: tarot-data-layer
tags: [supabase, migration, static-assets, data-layer]
dependency_graph:
  requires: []
  provides:
    - "tarot_cards Supabase 테이블 (7컬럼 스키마 + RLS + 22 row seed) — 운영 적용 후 Wave 2/3 즉시 사용 가능"
    - "fetchTarotCards() async function (src/lib/supabase.js)"
    - "getCardImageUrl(id) / prefetchAllCardImages() (src/assets/images/cards/index.js)"
    - "22장 webp 카드 이미지 (src/assets/images/cards/00.webp ~ 21.webp)"
  affects: []
tech_stack:
  added: []
  patterns:
    - "Vite 정적 webp import (fingerprint URL, 22장 개별 import)"
    - "Supabase RLS: ENABLE ROW LEVEL SECURITY + SELECT USING(true), INSERT/UPDATE/DELETE 정책 미정의 → anon 쓰기 자동 차단"
    - "dollar-quoted string ($$...$$) SQL INSERT — 한국어/이모지 escape 회피"
    - "ON CONFLICT (id) DO NOTHING — 마이그레이션 재실행 안전"
key_files:
  created:
    - "fortune-cat/scripts/20260502_create_tarot_cards.sql"
    - "fortune-cat/src/assets/images/cards/00.webp ~ 21.webp (22장)"
    - "fortune-cat/src/assets/images/cards/index.js"
  modified:
    - "fortune-cat/src/lib/supabase.js (fetchTarotCards 함수 추가)"
decisions:
  - "cards.ts 메시지 톤('~다냥') 그대로 SQL seed로 추출 — 프로토타입 정체성 유지"
  - "22장 webp 합계 ~3.5MB (RESEARCH A1 1MB 미만 가정 초과) — Wave 2/3 prefetch 정책 재검토 권장"
  - "createClient grep 카운트 2 = import 1회 + 인스턴스 생성 1회 (정상, 신규 클라이언트 생성 없음)"
metrics:
  duration: "~25분"
  completed: "2026-05-02"
  tasks_completed: 4
  tasks_total: 4
  task_1_2_applied_at: "2026-05-02"
  files_created: 25
  files_modified: 1
---

# Phase 3 Plan 01: tarot_cards 데이터 레이어 구축 Summary

Wave 2/3 UI가 즉시 소비할 수 있는 타로 데이터 레이어 — Supabase 마이그레이션 SQL(7컬럼 + RLS + 22 row seed), 22장 webp 정적 import 헬퍼, fetchTarotCards() 함수를 구축했다.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1.1 | tarot_cards 마이그레이션 SQL 작성 | b7d17af | scripts/20260502_create_tarot_cards.sql |
| 1.2 | 마이그레이션 운영 Supabase 수동 적용 | ✓ 사용자 확인 (2026-05-02 "통과") | — |
| 1.3 | 22장 webp 복사 + getCardImageUrl 헬퍼 | 72e8642 | src/assets/images/cards/ (23 files) |
| 1.4 | supabase.js에 fetchTarotCards() 추가 | da855dd | src/lib/supabase.js |

## Outputs

### scripts/20260502_create_tarot_cards.sql

- `CREATE TABLE IF NOT EXISTS tarot_cards` (7컬럼: id INT PK, name_ko, name_en, emoji, image_path, keywords TEXT[], message TEXT)
- `ALTER TABLE tarot_cards ENABLE ROW LEVEL SECURITY`
- `CREATE POLICY "tarot_cards_select_policy" ON tarot_cards FOR SELECT USING (true)`
- INSERT/UPDATE/DELETE 정책 미정의 → anon role 쓰기 자동 차단 (T-03-01 mitigation)
- 22장 seed (id 0~21, "~다냥" 톤 23회 확인, dollar-quoted string 사용)
- `ON CONFLICT (id) DO NOTHING` (T-03-02 mitigation)

### src/assets/images/cards/

- 22장 `.webp` (00.webp ~ 21.webp), 합계 **~3.5MB**
- `index.js`: `getCardImageUrl(id)` + `prefetchAllCardImages()` export (named only, default export 없음)

### src/lib/supabase.js (fetchTarotCards 추가)

```javascript
export async function fetchTarotCards()
// returns: Promise<Array<{id, name_ko, name_en, emoji, image_path, keywords, message}>>
// throws: Error (호출 측 Sentry.captureException 위임)
```

- 7컬럼 명시 select (SELECT * 사용 안 함)
- `.order('id', { ascending: true })` 필수
- 기존 export 5종 보존 (getMenuImageUrl/getAmuletStyleImageUrl/getAmuletIntroImageUrl/getOgImageUrl/getAmuletConfig)
- createClient 신규 호출 없음

## Verification Results

| 항목 | 결과 |
|------|------|
| SQL 7컬럼 정의 | PASS (7/7) |
| RLS ENABLE ROW LEVEL SECURITY | PASS |
| SELECT USING(true) 정책 | PASS |
| INSERT 22행 (id 0~21) | PASS |
| ON CONFLICT (id) DO NOTHING | PASS |
| "다냥" 톤 (>=10) | PASS (23회) |
| placeholder 없음 | PASS |
| 22장 webp 존재 | PASS |
| 파일명 00~21 패딩 | PASS |
| 22 import 라인 | PASS |
| getCardImageUrl export | PASS |
| prefetchAllCardImages export | PASS |
| fetchTarotCards export | PASS |
| tarot_cards from() 참조 | PASS |
| 7컬럼 select 명시 | PASS |
| order('id', ascending) | PASS |
| SELECT * 사용 금지 | PASS |
| createClient 신규 없음 | PASS |
| Vite build | PASS (fortune-cat.ait 생성) |
| v1.0 파일 미수정 | PASS |
| granite.config.ts / package.json / lock 파일 미수정 | PASS |

## Task 1.2 Checkpoint (Human Action Required)

Task 1.2는 `checkpoint:human-action` 타입으로 사용자가 Supabase Studio에서 직접 마이그레이션을 적용해야 합니다.

**적용 절차:**
1. Supabase Studio (`saju.trinity-apps.net` 운영 프로젝트) 접속
2. SQL Editor → New query → `scripts/20260502_create_tarot_cards.sql` 전체 내용 복사·붙여넣기
3. Run 실행 → 에러 없이 완료 확인
4. Table Editor → `tarot_cards` → 22행 표시 확인

**검증 쿼리 (Studio SQL Editor에서 실행):**
```sql
SELECT count(*) FROM tarot_cards;          -- 결과: 22
SELECT id FROM tarot_cards ORDER BY id LIMIT 3;  -- 결과: 0, 1, 2
SELECT id FROM tarot_cards ORDER BY id DESC LIMIT 1; -- 결과: 21
```

**RLS 검증 (anon role impersonation):**
```sql
-- anon role로 SELECT → 결과 22 (USING(true) 통과)
SELECT count(*) FROM tarot_cards;
-- anon role로 INSERT 시도 → "new row violates row-level security policy" 에러 (T-03-01 검증)
INSERT INTO tarot_cards (id, name_ko, name_en, emoji, image_path, keywords, message)
  VALUES (99, 'x', 'y', 'z', '99.webp', ARRAY['t'], 'm');
```

## Known Issues / Notes

### 22장 webp 합계 초과 (RESEARCH A1 가정 불일치)

- **가정:** RESEARCH A1 — 22장 합계 1MB 미만
- **실측:** ~3.5MB (3,674,112 bytes)
- **영향:** Wave 2/3에서 `prefetchAllCardImages()` 호출 타이밍 재검토 권장 (intro mount 즉시가 아닌 idle 시점 또는 lazy load 고려)
- **현재 판단:** 빌드 통과, AIT 번들 포함됨. 사용자가 타로 탭 첫 진입 시 3.5MB가 번들에 포함되므로 앱 자체 크기 증가. Phase 4·5 성능 검토 시 확인 필요.

### ESLint pre-existing errors (scope 외부)

- 기존 파일 27개 ESLint 오류 (pre-existing) — 본 plan 스코프 외
- 신규 파일(`index.js`, `supabase.js` 추가 부분)은 ESLint PASS

## Wave 2/3 인터페이스 명세 (잠금)

Wave 2 UI 컴포넌트가 import할 인터페이스:

```javascript
// from src/lib/supabase.js
import { fetchTarotCards } from '../lib/supabase';
// returns: Promise<Array<{id, name_ko, name_en, emoji, image_path, keywords, message}>>

// from src/assets/images/cards/index.js
import { getCardImageUrl, prefetchAllCardImages } from '../assets/images/cards/index';
// getCardImageUrl(id: 0~21): string (fingerprinted webp URL)
// prefetchAllCardImages(): void (intro mount 직후 호출 권장)
```

## Resolved Cross-Phase Items

- **Phase 1 GAPS.md "카드 이미지 형식"**: PNG 가정 → webp 실제 형식 확정 (D-11) — 본 plan에서 종결

## Deviations from Plan

### 자동 수정

없음 — 계획대로 실행.

### 참고 사항

1. **RESEARCH A1 가정 불일치**: 22장 webp 합계 ~3.5MB (가정 1MB 미만 초과) — Known Issues 섹션에 기록. Wave 2/3 prefetch 전략 재검토 권장.
2. **ESLint 전체 실행 시 27개 오류**: 모두 기존 파일 pre-existing. 신규 코드는 PASS. 수정 스코프 외.

## Self-Check: PASSED

| 항목 | 결과 |
|------|------|
| scripts/20260502_create_tarot_cards.sql | FOUND |
| src/assets/images/cards/index.js | FOUND |
| src/assets/images/cards/00.webp ~ 21.webp | FOUND |
| src/lib/supabase.js | FOUND |
| commit b7d17af (SQL) | FOUND |
| commit 72e8642 (images + index.js) | FOUND |
| commit da855dd (fetchTarotCards) | FOUND |
