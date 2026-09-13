---
phase: quick-260913-nez
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/DeepReadingResult.jsx
autonomous: true
requirements:
  - QUICK-NEZ-01
user_setup:
  - (선택) Supabase new_year_fortune_types / ai_saju_types의 description_ko에 홈 카드 카피 반영 — 코드 변경 아님
---

<objective>
궁합·애정운(연애상담 모드) 사용자가 **후속질문 첫 1회가 무료**라는 사실을 화면에서 인지하도록
안내 문구와 배너를 추가한다. 백엔드는 이미 구현·배포 완료 상태이며, 프런트 수정 없이도 흐름은
동작한다 — 이번 작업은 "알게 하는 것"이 전부다.

지시서: `docs/연애상담모드 무료질문1회.md`
Output: 미리보기 카피 분기 + 무료 질문 배너 + 사용 직후 고지 + 계측 2종.
</objective>

<context>
- 백엔드 판정(`catbot-backend/constants.py`): `LOVE_COUNSELING_READING_TYPES = {"new_year_2026_love"}`
  + `reading_type.startswith("match:")`. 프런트가 보낼 필드는 없고, 모드는 백엔드가 자동 결정한다.
- 프런트의 `readingType`은 Supabase 메뉴 테이블 값이다 (실측):
  애정운 = `new_year_2026_love` (new_year_fortune_types), 궁합 = `new_year_compatibility` (ai_saju_types).
  보관함 재진입 시에는 `match:` 접두사가 오고(LibraryPage L204), `userData.isCompatibility`도 채워진다.
- 무료 질문 조건(백엔드 `should_use_free_followup`): 궁합·애정운 + 후속 잔여 0 + `total_purchased === 0`
  + `free_followups_used === 0`. 프런트는 **안내 표시 여부만** 같은 조건으로 계산한다.
- API 추가 필드(둘 다 기본값 있음): `GET /quota.free_followups_used`,
  chat 응답 `free_followup_used: boolean`. `getQuota()`는 그대로 쓴다.
</context>

<tasks>

<task type="auto">
  <name>Task 1: 대상 판정 + quota 상태</name>
  <files>src/components/DeepReadingResult.jsx</files>
  <action>
- `isLoveCounseling` 헬퍼 1곳: readingType이 `new_year_2026_love` / `new_year_compatibility` 이거나
  `match` 접두사이거나 `userData.isCompatibility ?? !!userData.partnerName`.
- `applyQuota`에서 `freeFollowupAvailable` 계산:
  `isLoveCounseling && (total_purchased ?? 0) === 0 && (free_followups_used ?? 0) === 0`.
- 프런트에서 횟수를 로컬로 세거나 저장하지 않는다 — /quota와 chat 응답 플래그만 신뢰.
  </action>
  <done>다른 메뉴에서는 항상 false, 궁합·애정운 미결제 계정에서만 true.</done>
</task>

<task type="auto">
  <name>Task 2: 미리보기 카피·무료공개 버튼 라벨 분기</name>
  <files>src/components/DeepReadingResult.jsx</files>
  <action>
- 무료공개 안내 괄호 문구: 연애상담 대상이면 "무료 1회 공개 + 연애상담 모드 첫 질문 1회 무료"로 교체,
  아니면 기존 문구 유지. 단 `freeFollowupAvailable`이 false면(이미 사용) 첫 질문 무료를 약속하지 않는다.
- 무료공개 버튼 라벨도 대상일 때만 "무료로 보기 + 연애상담 질문 1회"로 차별화.
- 결제 버튼·결제 카드·가격 로직은 손대지 않는다.
  </action>
  <done>찐재물운·성격분석 미리보기 문구·라벨이 기존과 100% 동일.</done>
</task>

<task type="auto">
  <name>Task 3: 무료 질문 배너 + 사용 직후 고지</name>
  <files>src/components/DeepReadingResult.jsx</files>
  <action>
- 배너 노출 조건 `!previewActive && freeFollowupAvailable`. 위치는 하단 입력창 위
  ("남은 질문 N회" 라벨 자리 — 잔여 0이라 이 라벨은 보이지 않아 레이아웃 재배치가 없다).
  제목 "연애상담 모드 · 첫 질문 1회 무료" + 본문 1줄.
- chat 응답 `result.free_followup_used === true`이면 `freeFollowupAvailable`을 false로 내리고
  "무료 질문을 사용했어요. 이어서 질문하려면 결제가 필요해요 (10회)" 한 줄을 입력창 위에 표시.
  결제 버튼은 새로 만들지 않는다 — 다음 메시지의 기존 결제 카드에 맡긴다.
- `handleFreeReveal`의 "첫 질문에서 결제 유도" 주석을 실제 동작에 맞게 정정.
  </action>
  <done>배너 탭/입력 동작은 기존과 동일하고, 두 번째 메시지는 기존 결제 카드 그대로.</done>
</task>

<task type="auto">
  <name>Task 4: 계측</name>
  <files>src/components/DeepReadingResult.jsx</files>
  <action>
기존 `firePaywall`(Firebase + Supabase 동시 발화) 패턴 재사용.
- `free_followup_banner_shown` — 배너 최초 노출 시 1회 (reading_type, session_id)
- `free_followup_used` — chat 응답 플래그 수신 시 (reading_type, thread_id, session_id)
기존 `paywall_shown`(trigger: followup)은 손대지 않는다.
  </action>
  <done>배너가 리렌더돼도 shown 이벤트는 1회만 발화.</done>
</task>

<task type="auto">
  <name>Task 5: 빌드 검증</name>
  <files>[]</files>
  <action>변경 파일 eslint 0 errors + `npm run build` 성공.</action>
  <done>AIT 빌드 통과.</done>
</task>

</tasks>

<verification>
지시서 QA 체크리스트 1~9 기준. 특히 8번(찐재물운·성격분석 문구 일절 없음)과
5번(재진입 시 이미 사용했으면 배너 미노출 — 백엔드 카운터가 정본).
</verification>
