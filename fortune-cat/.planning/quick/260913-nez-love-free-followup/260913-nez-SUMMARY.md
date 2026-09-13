---
quick_id: 260913-nez
title: 궁합·애정운 연애상담 모드 무료 질문 1회 안내 문구·배너
date: 2026-09-13
status: complete
---

# Quick Task 260913-nez — Summary

## 목표
백엔드가 이미 배포한 "궁합·애정운 후속채팅 첫 1회 무료"를 사용자가 화면에서 인지하게 한다.
지시서: `docs/연애상담모드 무료질문1회.md`. 이번 작업은 안내(문구·배너)가 전부다.

## 지시서와 다른 점 (확인 후 반영)
- 백엔드 `LOVE_COUNSELING_READING_TYPES`는 `{"new_year_2026_love"}` **하나뿐**이고, 궁합은
  `reading_type.startswith("match:")`로 잡는다(`catbot-backend/constants.py:49-58`).
  프런트의 `readingType`은 Supabase 메뉴 값이라 궁합이 `new_year_compatibility`로 오므로,
  지시서의 프런트 판정식(두 값 + isCompatibility)이 맞다. 여기에 보관함 재진입용
  `match` 접두사까지 포함했다.
- 미리보기 카피는 `isLoveCounseling`만이 아니라 **`freeFollowupAvailable`까지** 걸었다.
  무료분을 이미 쓴 계정에 "첫 질문 1회 무료"를 약속하면 안 되기 때문.

## 변경 내용 (`src/components/DeepReadingResult.jsx` 단일 파일)
- `LOVE_COUNSELING_TYPES` 상수 + `isLoveCounseling` 판정 1곳.
- `applyQuota`에서 `freeFollowupAvailable` 계산 — 백엔드 `should_use_free_followup`과 동일 조건
  (`total_purchased === 0 && free_followups_used === 0`). 로컬 카운트·저장 없음.
- 미리보기: 무료공개 안내 괄호 문구 → "(무료 1회 공개 + 연애상담 모드 첫 질문 1회 무료)",
  무료공개 버튼 라벨 → "무료로 보기 + 연애상담 질문 1회". 대상이 아니면 기존 문구 그대로.
- 전체 풀이 후: 입력창 위 배너 "💜 연애상담 모드 · 첫 질문 1회 무료" +
  "사주 풀이와 함께 지금 상황을 듣고 답해드려요. 궁금한 걸 하나 물어보세요."
  (애정운·궁합 양쪽에 자연스럽도록 "두 분의" 대신 중립 표현 사용. 지시서 초안의
  "사주 풀이가 아니라"는 사실과 달라 Trinity 지시로 "사주 풀이와 함께"로 정정)
- chat 응답 `free_followup_used` → 배너 해제 + "무료 질문을 사용했어요. 이어서 질문하려면
  결제가 필요해요 (10회)" 한 줄. 결제 버튼은 만들지 않고 기존 결제 카드에 맡김.
- 결제 성공(첫 풀이·후속충전) 시 배너 즉시 해제 — 지시서에 없던 케이스. 결제 이력이 생기면
  백엔드 조건상 무료 대상에서 빠지는데, quota를 재조회하지 않으면 세션 내에 배너가 남는다.
- `handleFreeReveal`의 "첫 질문에서 결제 유도" 주석을 실제 동작에 맞게 정정.
- 계측: `free_followup_banner_shown`(ref 가드로 최초 1회) / `free_followup_used`.

## 하지 않은 것 (지시서 🚫 준수)
- 결제 카드·결제 플로우·가격 표시 로직 무수정.
- 찐재물운·성격분석 등 다른 메뉴에 문구 추가 없음 — 모든 신규 UI가 `freeFollowupAvailable`
  (→ `isLoveCounseling`) 뒤에 있다.
- "연애상담 모드" 토글/선택 UI 없음. 모드는 백엔드가 자동 결정.

## 검증
- `npx eslint src/components/DeepReadingResult.jsx` → 0 errors/0 warnings.
- `npm run build` → AIT 빌드 성공.
- 실기기 QA 필요: 지시서 체크리스트 1~9, 특히 8번(다른 메뉴 무변화)과 5번(재진입 시 미노출).

## 남은 작업 (코드 아님)
- 홈 카드 카피는 Supabase `new_year_fortune_types`/`ai_saju_types`의 `description_ko` 데이터 변경.
  예: "연애상담 모드 첫 질문 무료". Trinity 확정 후 반영.

---

## 후속 작업 — 개발 빌드 전용 quota 오버라이드 (QA 지원)

### 배경
개발자 계정은 이미 결제 이력이 있어(`total_purchased=4`, `free_reveals_used=1`,
`followup_remaining=8`) 새 UI가 **하나도 노출되지 않는다** — 정상 동작이지만 문구 확인이 불가능했다.
`user_paid_quotas`는 RLS로 막혀 앱 anon 키로는 조회·수정도 안 된다(200 + 빈 배열).

### 변경 내용 (`src/lib/deepReadingPurchase.js`)
- `applyDebugQuota()` — `getQuota()` 응답에 `.env.development`의 `VITE_DEBUG_QUOTA`(JSON)를 병합.
  일부 필드만 덮어쓰고 나머지는 서버 값 유지.
- `import.meta.env.DEV` 가드 → 프로덕션 빌드에서 제거됨.
  검증: `npm run build` 후 `grep -rl VITE_DEBUG_QUOTA dist/` → 0건.
- `.env.development`(gitignore 대상, 커밋되지 않음)에 시나리오 4종 프리셋을 주석으로 추가.

### 한계 (문서화 필수)
화면 표시만 바꾼다. 백엔드는 실제 계정 상태로 동작하므로 무료 공개는 403,
무료 질문은 유료 처리될 수 있다. **백엔드 실동작까지 확인하려면 Supabase SQL Editor에서
`user_paid_quotas` 행을 직접 리셋**해야 한다(복원용 현재값: reading 0 / followup 8 /
purchased 4 / free_reveals 1 / free_followups 0).
