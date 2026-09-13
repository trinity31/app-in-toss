-- 결제 상태별 화면 QA용 quota 조작 — Supabase 대시보드 → SQL Editor 에서 실행
--
-- 대상: 개발자 계정 (src/config/ads.js 의 테스트 익명키)
-- 범위: user_paid_quotas 의 "잔여 상태"만 바꾼다. payment_histories 는 건드리지 않는다.
--       grant_purchase 는 order_id 멱등이라 과거 결제가 재적립되지 않고, 매출 데이터에도 영향 없다.
--
-- ⚠️ 실행 전 현재값을 반드시 확인하고 기록할 것 (아래 0번). 복원은 6번.

-- ────────────────────────────────────────────────────────────
-- 0) 현재값 확인 (실행 전/후 항상)
-- ────────────────────────────────────────────────────────────
select user_anonymous_id, reading_remaining, followup_remaining,
       total_purchased, free_reveals_used, free_followups_used, updated_at
  from user_paid_quotas
 where user_anonymous_id = 'CYVJ69j65gsXUnChiroCNzFmTfo';

-- 2026-09-13 기록된 값 (복원 기준):
--   reading_remaining=0, followup_remaining=8, total_purchased=4,
--   free_reveals_used=1, free_followups_used=0


-- ────────────────────────────────────────────────────────────
-- 1) 신규 사용자 상태 — 무료 1회 공개 버튼 + 연애상담 첫 질문 무료 문구
--    확인: 애정운·궁합 미리보기에서
--      "(무료 1회 공개 + 연애상담 모드 첫 질문 1회 무료)"
--      "무료로 보기 + 연애상담 질문 1회" 버튼
--    함께 확인: 찐재물운·성격분석은 기존 문구 그대로인지 (QA #8)
-- ────────────────────────────────────────────────────────────
update user_paid_quotas
   set reading_remaining = 0,
       followup_remaining = 0,
       total_purchased = 0,
       free_reveals_used = 0,
       free_followups_used = 0,
       updated_at = now()
 where user_anonymous_id = 'CYVJ69j65gsXUnChiroCNzFmTfo';


-- ────────────────────────────────────────────────────────────
-- 2) 무료 공개 직후 상태 — 연애상담 무료 질문 배너
--    (1번 실행 후 앱에서 무료 공개를 누르면 자연히 이 상태가 된다.
--     앱을 거치지 않고 배너만 보려면 아래를 실행)
--    확인: 입력창 위 "💜 연애상담 모드 · 첫 질문 1회 무료" 배너
--          질문 1회 던지면 "무료 질문을 사용했어요…" 고지 + 배너 사라짐
-- ────────────────────────────────────────────────────────────
update user_paid_quotas
   set reading_remaining = 0,
       followup_remaining = 0,
       total_purchased = 0,
       free_reveals_used = 1,
       free_followups_used = 0,
       updated_at = now()
 where user_anonymous_id = 'CYVJ69j65gsXUnChiroCNzFmTfo';


-- ────────────────────────────────────────────────────────────
-- 3) 보유 풀이 크레딧 — "보유한 풀이 1회로 전체보기"
--    확인: 미리보기에 "이전 결제로 받은 풀이 1회가 남아 있어요" +
--          크레딧 버튼만 노출(결제·무료·할인 버튼 숨김)
-- ────────────────────────────────────────────────────────────
update user_paid_quotas
   set reading_remaining = 1,
       followup_remaining = 0,
       total_purchased = 1,
       updated_at = now()
 where user_anonymous_id = 'CYVJ69j65gsXUnChiroCNzFmTfo';


-- ────────────────────────────────────────────────────────────
-- 4) 후속질문 소진 — 후속 결제 카드 문구
--    확인: 질문 전송 시 "N원 한 번이면 … 다른 유료 풀이 1회도 추가 결제 없이" +
--          버튼 "N원으로 질문 10회 + 풀이 1회 받기"
-- ────────────────────────────────────────────────────────────
update user_paid_quotas
   set reading_remaining = 0,
       followup_remaining = 0,
       total_purchased = 1,
       free_reveals_used = 1,
       free_followups_used = 1,
       updated_at = now()
 where user_anonymous_id = 'CYVJ69j65gsXUnChiroCNzFmTfo';


-- ────────────────────────────────────────────────────────────
-- 5) 결제 사용자 — 배너·무료 버튼 모두 미노출, "남은 질문 N회" 라벨
-- ────────────────────────────────────────────────────────────
update user_paid_quotas
   set reading_remaining = 0,
       followup_remaining = 10,
       total_purchased = 1,
       free_reveals_used = 1,
       free_followups_used = 1,
       updated_at = now()
 where user_anonymous_id = 'CYVJ69j65gsXUnChiroCNzFmTfo';


-- ────────────────────────────────────────────────────────────
-- 6) 복원 — QA 종료 후 반드시 실행 (2026-09-13 기준값)
-- ────────────────────────────────────────────────────────────
update user_paid_quotas
   set reading_remaining = 0,
       followup_remaining = 8,
       total_purchased = 4,
       free_reveals_used = 1,
       free_followups_used = 0,
       updated_at = now()
 where user_anonymous_id = 'CYVJ69j65gsXUnChiroCNzFmTfo';


-- 참고: 스레드 공개 상태(deep_reading_caches.is_revealed)는 건드리지 않는다.
-- 이미 공개된 풀이는 미리보기로 돌아가지 않으므로, 미리보기 화면을 다시 보려면
-- 새 풀이를 생성해야 한다.
