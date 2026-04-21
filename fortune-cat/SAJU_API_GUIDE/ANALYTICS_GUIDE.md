# 백엔드 전달 지침 — 딥리딩 사용자 행동 분석

## 배경

**딥리딩(심층 사주·궁합 리딩) 플로우 한정** 으로 사용자 행동 분석을 시작합니다. 사주 기본 플로우(`/saju-reading`)와 부적 주문(`/amulet-order`) 은 이번 분석 대상이 **아닙니다**.

목표 지표:
- **재방문** — 동일 `user_anonymous_id` 의 재등장 빈도/cohort
- **후속질문 수** — 한 리딩 세션 동안 던지는 follow-up 개수
- **체류 시간** — 리딩 시작부터 마지막 상호작용까지의 길이

클라이언트는 딥리딩 엔드포인트에 아래 두 식별자를 실어 보냅니다. 백엔드는 이 요청을 받을 때 **자동으로 `user_events` / `user_sessions` 테이블에 기록** 해 주세요.

- `user_anonymous_id` (string) — 토스 SDK `getAnonymousKey` 해시 (미니앱별 고정 유저키)
- `session_id` (string, UUID) — **`/deep-reading/start` 또는 `/deep-reading-match/start` 호출 시 클라이언트가 새로 발급**. 이후 같은 리딩의 후속 `/chat` 호출들은 동일 `session_id` 유지

---

## 대상 엔드포인트

| 엔드포인트 | 메서드 | body 타입 | 추가되는 필드 | 분석 이벤트 |
|---|---|---|---|---|
| `/deep-reading/start` | POST | FormData | `user_anonymous_id`, `session_id` | `reading_started` |
| `/deep-reading-match/start` | POST | JSON | `user_anonymous_id`, `session_id` | `reading_started` |
| `/deep-reading/chat` | POST | JSON | `user_anonymous_id`, `session_id`, (기존 `thread_id`, `message`) | `follow_up_question` |
| `/deep-reading-match/chat` | POST | JSON | `user_anonymous_id`, `session_id`, (기존 `thread_id`, `message`) | `follow_up_question` |

> 필드는 **옵셔널**. 누락돼도 요청 처리는 성공해야 하고, 분석 insert 만 skip 하세요.
> `/saju-reading`, `/amulet-order` 는 `user_anonymous_id` 는 전달되지만 `session_id` 는 **없습니다**. 분석 로깅 대상이 아닙니다.

---

## 요구사항 1 — Supabase 분석 테이블 생성

다음 2개 테이블을 신규 생성 해 주세요. RLS 는 **anon 쓰기 불가** 로 설정 (백엔드 서비스 롤만 쓰기). 클라이언트는 이 테이블에 직접 접근하지 않습니다.

### `user_events` — 원시 이벤트 로그
```sql
create table user_events (
  id uuid primary key default gen_random_uuid(),
  user_anonymous_id text not null,
  session_id text,
  event_name text not null,
  event_params jsonb default '{}'::jsonb,
  endpoint text,          -- '/deep-reading/chat' 등
  http_method text,
  latency_ms integer,     -- 서버 처리 시간 (선택)
  ip_hash text,           -- SHA256(IP + daily_salt)
  user_agent text,
  created_at timestamptz not null default now()
);

create index on user_events (user_anonymous_id, created_at desc);
create index on user_events (session_id, created_at);
create index on user_events (event_name, created_at desc);
create index on user_events using gin (event_params);
```

### `user_sessions` — 리딩 세션 집계
```sql
create table user_sessions (
  session_id text primary key,
  user_anonymous_id text not null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  duration_ms integer generated always as (
    (extract(epoch from (last_seen_at - started_at)) * 1000)::integer
  ) stored,
  event_count integer default 0,
  entry_endpoint text,    -- '/deep-reading/start' or '/deep-reading-match/start'
  is_compatibility boolean default false,
  user_agent text
);

create index on user_sessions (user_anonymous_id, started_at desc);
create index on user_sessions (last_seen_at desc);
```

**세션 upsert 전략**:
- 요청 수신 시 `session_id` 가 있으면 `INSERT ... ON CONFLICT (session_id) DO UPDATE SET last_seen_at = now(), event_count = event_count + 1`
- `user_anonymous_id`, `entry_endpoint`, `is_compatibility`, `user_agent` 는 최초 insert 시에만 채워둠 (변경 금지)
- **체류 시간** 은 `started_at` ↔ `last_seen_at` 의 차이로 자동 계산 (생성 컬럼). 마지막 `/chat` 호출 시점까지가 포함되므로, 유저가 마지막 답변을 읽는 시간은 집계에 포함되지 않음 (허용 가능한 근사치).

---

## 요구사항 2 — 엔드포인트별 자동 로깅

각 요청 처리 시 **성공·실패 무관하게** `user_events` 에 1행 insert + `user_sessions` upsert 해 주세요 (fire-and-forget, 분석 insert 실패가 본 요청에 영향 주지 않도록).

| 엔드포인트 | event_name | event_params 에 포함 |
|---|---|---|
| `/deep-reading/start` | `reading_started` | `{ reading_type, concerns }` |
| `/deep-reading-match/start` | `reading_started` | `{ concerns, compatibility: true }` |
| `/deep-reading/chat` | `follow_up_question` | `{ thread_id, message_length, question_index }` |
| `/deep-reading-match/chat` | `follow_up_question` | `{ thread_id, message_length, question_index }` |

**공통 저장 필드**:
- `user_anonymous_id`, `session_id`, `endpoint`, `http_method`
- `latency_ms` (처리 시간 측정하여 기록)
- `user_agent` (`User-Agent` 헤더)
- `ip_hash` — 원문 IP 저장 금지. 일별 솔트로 해시 (`SHA256(ip + date)`)

**PII 정책**:
- `message`, `name`, `birthdate`, `phone`, `email` 등 개인정보는 **절대 `event_params` 에 저장 금지**
- `message_length`, `question_index` 처럼 메타만 허용

---

## 요구사항 3 — 집계 뷰 (옵션, 분석 편의용)

```sql
-- 유저별 방문 일수 (재방문)
create view v_user_daily_visits as
select user_anonymous_id,
       count(distinct date_trunc('day', created_at)) as days_visited,
       count(distinct session_id) as total_sessions,
       min(created_at) as first_seen_at,
       max(created_at) as last_seen_at
from user_events
group by 1;

-- 유저별 / 세션별 후속질문 수
create view v_user_followups as
select user_anonymous_id,
       count(*) filter (where event_name = 'follow_up_question') as total_followups,
       count(distinct session_id) filter (where event_name = 'follow_up_question') as sessions_with_followup,
       count(distinct session_id) as total_sessions,
       round(
         count(*) filter (where event_name = 'follow_up_question')::numeric
         / nullif(count(distinct session_id), 0)
       , 2) as avg_followups_per_session
from user_events
group by 1;

-- 일별 리딩 세션 통계 (체류 시간 포함)
create view v_session_stats_daily as
select date_trunc('day', started_at) as day,
       count(*) as sessions,
       count(distinct user_anonymous_id) as unique_users,
       count(*) filter (where is_compatibility) as compatibility_sessions,
       avg(duration_ms)/1000 as avg_seconds,
       percentile_cont(0.5) within group (order by duration_ms)/1000 as median_seconds,
       percentile_cont(0.9) within group (order by duration_ms)/1000 as p90_seconds,
       avg(event_count) as avg_events_per_session
from user_sessions
where started_at > now() - interval '90 days'
group by 1
order by 1 desc;
```

---

## 응답 형태 / 변경 없음

- 로깅은 **내부 기록**, API 응답 스키마는 변경 없음.
- 필드가 없는 구 버전 클라이언트 요청도 기존과 동일하게 처리. 로깅만 skip.

---

## 데이터 보존 / 프라이버시

- `user_events`, `user_sessions` 는 **180일** 보관 후 자동 삭제 (pg_cron 권장)
- 유저의 "데이터 삭제 요청" 시 `user_anonymous_id` 로 일괄 삭제 가능해야 함 (GDPR)

---

## 검증 방법

1. 딥리딩 시작 → 결과 화면에서 후속질문 3회 → 앱 백그라운드 5분 → 다시 후속질문 1회:
   - `user_events`: 동일 `session_id` 로 `reading_started` 1건 + `follow_up_question` 4건
   - `user_sessions`: 1행, `event_count = 5`, `duration_ms` 가 5분+α
2. 리딩 완료 후 **새 딥리딩 시작** → 별도 `session_id` 발급되어 새로운 세션 레코드 생성
3. 궁합(`/deep-reading-match/*`) 은 `is_compatibility=true` 로 구분되어 기록

---

## 연락처

필드 의미나 스키마 질문은 클라이언트 담당자에게 문의해 주세요. 필드 누락에도 구·신 클라이언트 모두 안전하게 동작하므로 **동시 배포 가능**.
