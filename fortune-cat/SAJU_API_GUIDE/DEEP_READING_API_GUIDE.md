# Deep Reading 채팅 API 가이드

대화형 사주풀이 API입니다. 첫 턴에서 사주 정보를 전달하면 `thread_id`가 발급되고, 이후 해당 `thread_id`로 자유롭게 대화를 이어갈 수 있습니다.

## 대화 흐름

```
┌──────────┐                        ┌──────────┐
│ 클라이언트 │                        │   서버    │
└────┬─────┘                        └────┬─────┘
     │                                   │
     │  POST /deep-reading/start         │
     │  (사주 정보 + 첫 질문)              │
     │ ─────────────────────────────────► │
     │                                   │  사주 계산
     │                                   │  멀티-에이전트 실행
     │  { thread_id, reading }           │
     │ ◄───────────────────────────────── │
     │                                   │
     │  thread_id 저장                    │
     │                                   │
     │  POST /deep-reading/chat          │
     │  { thread_id, message }           │
     │ ─────────────────────────────────► │
     │                                   │  이전 대화 복원
     │                                   │  멀티-에이전트 실행
     │  { reading }                      │
     │ ◄───────────────────────────────── │
     │                                   │
     │  POST /deep-reading/chat          │
     │  { thread_id, message }           │
     │ ─────────────────────────────────► │
     │          ...반복...                │
```

## 인증

Production 환경에서는 모든 요청에 `X-API-Key` 헤더가 필요합니다.

```
X-API-Key: your-api-key-here
```

Development 환경에서는 생략 가능합니다.

---

## API 엔드포인트

### 1. 대화 시작 — `POST /deep-reading/start`

사주 정보(생년월일)와 첫 질문을 전달합니다. 사주 계산 후 멀티-에이전트가 분석을 수행합니다.

#### 요청

- **Content-Type**: `multipart/form-data`

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| `name` | string | O | — | 이름 |
| `gender` | string | O | — | `"male"` 또는 `"female"` |
| `datetime` | string | O | — | 생년월일 (`YYYY-MM-DD`) |
| `hour` | string | | — | 출생 시 (`01`~`12`) |
| `minute` | string | | — | 출생 분 (`00`~`59`) |
| `am_pm` | string | | — | `"AM"` 또는 `"PM"` |
| `birthday_type` | string | | `"solar"` | `"solar"` (양력) 또는 `"lunar"` (음력) |
| `reading_type` | string | | — | 분석 타입 힌트 (예: `"personality"`, `"career"`) |
| `concerns` | string | | — | 궁금한 점 (자유 텍스트) |
| `language` | string | | `"ko"` | 응답 언어 (`"ko"`, `"en"`) |

> **참고**: `hour`, `minute`, `am_pm`을 모두 생략하면 시간 미상으로 처리됩니다.

> **참고**: `concerns`와 `reading_type`을 모두 생략하면 "종합 사주풀이"로 처리됩니다.

#### 응답

```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "reading": "## 사주 분석 결과\n\n김철수님의 사주를 살펴보면..."
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `thread_id` | string | 대화 세션 ID — 이후 채팅에 필요하므로 반드시 저장 |
| `reading` | string | 풀이 결과 (마크다운 형식) |

#### cURL 예시

```bash
curl -X POST http://localhost:8000/deep-reading/start \
  -F "name=김철수" \
  -F "gender=male" \
  -F "datetime=1990-03-15" \
  -F "hour=02" \
  -F "minute=30" \
  -F "am_pm=PM" \
  -F "birthday_type=solar" \
  -F "concerns=올해 이직하려고 하는데 좋은 시기일까요?" \
  -F "language=ko"
```

---

### 2. 후속 채팅 — `POST /deep-reading/chat`

이전 대화를 이어서 추가 질문을 합니다. 서버가 `thread_id`로 이전 대화 컨텍스트(사주 정보, 이전 분석 결과 등)를 자동 복원합니다.

#### 요청

- **Content-Type**: `application/json`

```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "그러면 재물운은 어떤가요?"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `thread_id` | string | O | `/deep-reading/start`에서 받은 세션 ID |
| `message` | string | O | 사용자 질문 |

#### 응답

```json
{
  "reading": "재물운을 살펴보면..."
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `reading` | string | 풀이 결과 (마크다운 형식) |

#### cURL 예시

```bash
curl -X POST http://localhost:8000/deep-reading/chat \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "재물운도 알려주세요"
  }'
```

---

## 프론트엔드 구현 가이드

### Content-Type 주의

| 엔드포인트 | Content-Type |
|------------|-------------|
| `/deep-reading/start` | `multipart/form-data` |
| `/deep-reading/chat` | `application/json` |

### thread_id 관리

- `/deep-reading/start` 응답에서 받은 `thread_id`를 클라이언트 state에 저장
- 이후 모든 `/deep-reading/chat` 요청에 동일한 `thread_id` 포함
- 새로운 사주 분석을 시작하려면 `/deep-reading/start`를 다시 호출 (새 `thread_id` 발급)

### 응답 시간

멀티-에이전트가 여러 도구를 호출하며 분석하므로, 응답까지 **10~30초** 소요될 수 있습니다.
로딩 인디케이터(스피너 등)를 표시하는 것을 권장합니다.

### 대화 예시 시나리오

```
[Turn 1 - start]
사용자: "올해 이직하려고 하는데 좋은 시기일까요?"
→ career_agent가 분석 → tongbyun_agent가 최종 풀이

[Turn 2 - chat]
사용자: "그러면 연애운은 어때요?"
→ love_agent가 분석 → tongbyun_agent가 최종 풀이

[Turn 3 - chat]
사용자: "직업운이랑 재물운을 같이 봐주세요"
→ career_agent + wealth_agent 병렬 분석 → tongbyun_agent가 종합 풀이

[Turn 4 - chat]
사용자: "종합적으로 올해 운세를 정리해 주세요"
→ comprehensive_agent가 전체 분석 → tongbyun_agent가 최종 풀이
```

### 에러 처리

| 상황 | HTTP 코드 | 응답 |
|------|-----------|------|
| 서버 에러 | 500 | `{ "detail": "심화 사주풀이 시작 중 오류가 발생했습니다: ..." }` |
| 서버 에러 (채팅) | 500 | `{ "detail": "채팅 중 오류가 발생했습니다: ..." }` |

> **참고**: 잘못된 `thread_id`를 전달하면 새로운 대화로 시작되지만, 사주 컨텍스트가 없어 정상적인 분석이 불가능합니다. 유효한 `thread_id`를 사용해 주세요.
