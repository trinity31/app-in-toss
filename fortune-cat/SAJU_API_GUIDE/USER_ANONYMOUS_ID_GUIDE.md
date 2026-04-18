# 백엔드 전달 지침 — `user_anonymous_id` 필드 수용

## 배경

앱인토스 SDK 에 **`getAnonymousKey`** API 가 추가되었습니다.
- 토스 로그인 동의 절차 없이 **미니앱별로 고유한 유저 해시 값(hash)** 을 발급받을 수 있습니다.
- 동일 기기/동일 유저 → 항상 동일 값. 미니앱이 달라지면 다른 값(미니앱별 고유).
- SDK `@apps-in-toss/web-framework@^2.4.5` 에서 동작 (토스앱 5.232.0 이상).
- 공식 문서: https://developers-apps-in-toss.toss.im/user-hash-key/intro.md

클라이언트(fortune-cat)는 **앱 진입 시 1회** `getAnonymousKey()` 를 호출해 React Context 에 캐싱하고, 이후 **모든 분석/주문 API 요청에 `user_anonymous_id`** 필드로 전달합니다. 기존 `userKey`(토스 로그인 기반)는 부적 결제 플로우에서 그대로 유지됩니다.

백엔드는 **이 필드를 받아서 로그·저장소에 기록**해 주세요. 식별자 통합/분석을 위한 최소 작업만 필요합니다.

---

## 식별자 비교

| 구분 | `userKey` | `user_anonymous_id` (신규) |
|---|---|---|
| 발급 주체 | 토스 로그인 (`appLogin`) → 백엔드 토큰 교환 | 클라이언트 SDK `getAnonymousKey()` |
| 유저 동의 | 필요 (로그인 팝업) | 불필요 |
| 제공 시점 | 부적 결제 시에만 | **앱 진입 직후 항상** |
| 값의 성격 | 토스 사용자 식별자 | 미니앱별 고유 해시 |
| 안정성 | 로그인 유지 한 유저는 영속 | 동일 기기/동일 유저 → 영속 |
| 서버에서 토스 API 호출용 | X (내부 식별 전용) | X (내부 식별 전용) |

> 두 값 모두 **서버에서 토스 API 를 직접 찌르는 용도로는 사용할 수 없음**(문서 명시).

---

## 변경되는 엔드포인트

다음 4개 요청에 `user_anonymous_id` 필드가 **추가**됩니다. 기존 필드는 그대로이고 **이 필드가 선택적으로 추가될 뿐**이므로, 수신 측에서만 유실 허용 + 저장 처리하면 됩니다.

### 1. `POST /saju-reading` (multipart/form-data)
FormData 신규 필드:
- `user_anonymous_id`: string | null

### 2. `POST /deep-reading/start` (multipart/form-data)
FormData 신규 필드:
- `user_anonymous_id`: string | null

### 3. `POST /deep-reading-match/start` (application/json)
JSON body 신규 필드:
```json
{
  "person1": { ... },
  "person2": { ... },
  "language": "ko",
  "concerns": "...",
  "user_anonymous_id": "<hash-string>"    // 신규
}
```

### 4. `POST /amulet-order` (application/json)
JSON body 신규 필드 (**기존 `userKey` 와 공존**):
```json
{
  "orderId": "...",
  "userKey": "<토스 로그인 userKey>",
  "user_anonymous_id": "<hash-string>",   // 신규 — 로그인 여부와 무관하게 항상 포함
  "tossName": "...",
  "phone": "...",
  "email": "...",
  "name": "...",
  "birthdate": { ... },
  "birthday_type": "solar | lunar",
  "gender": "male | female",
  "amuletType": "...",
  "amuletTypeTitle": "...",
  "productSku": "..."
}
```

---

## 수용 요구사항

1. **필드 타입/검증**
   - `user_anonymous_id`: `string`, 최대 길이 여유 있게 (권장: VARCHAR(128) 또는 그 이상).
   - **nullable/optional** 로 취급. 존재하지 않거나 `null`/`undefined` 여도 에러 없이 처리.
   - 포맷은 불투명 문자열로 간주(정규식 검증하지 마세요 — SDK 가 포맷을 바꿔도 호환되도록).

2. **저장 권장**
   - 모든 요청 로그에 `user_anonymous_id` 컬럼(또는 JSON 필드) 추가.
   - `amulet_orders` 테이블(또는 유사) 에 컬럼 추가해 `userKey`, `user_anonymous_id` **둘 다** 저장.
   - 분석용 이벤트(saju_reading, deep_reading 로그)에도 동일 컬럼 추가.

3. **인덱싱**
   - 동일 유저 재방문 집계/조회를 위해 `user_anonymous_id` 에 인덱스 생성 권장.

4. **기존 API 호환성**
   - 필드가 **없는 경우에도** 기존과 동일하게 동작해야 함 (구 SDK/앱 유저 폴백).
   - 이미 배포된 구 버전 클라이언트는 이 필드를 보내지 않습니다.

5. **응답 변경 없음**
   - 백엔드 응답 스키마는 변경 불필요. 단순 수신·저장만 하면 됩니다.

---

## 식별자 매칭 전략 (참고)

로그인 전·후 동일 유저를 연결하기 위해 다음 규칙을 권장합니다:

1. `user_anonymous_id` 를 **primary 분석 키** 로 사용 (로그인 여부와 무관하게 항상 수집됨).
2. `/amulet-order` 처럼 **두 값이 동시에 들어오는 시점** 에 `userKey ↔ user_anonymous_id` 매핑 테이블을 업데이트.
3. 같은 `user_anonymous_id` 로 들어온 과거 익명 이벤트를 해당 `userKey` 에 연결해 일관된 사용자 여정 구성.

---

## 테스트 가이드

- 샌드박스에서는 SDK 가 mock 해시를 반환합니다. 실제 운영값 확인은 **토스 실기기 + QR** 으로만 가능합니다(공식 문서 명시).
- 클라이언트에서 `console.log('[AnonymousKey] 발급:', key)` 로그로 실제 전달 값을 확인할 수 있습니다.

---

## 연락처

필드 저장/매핑 로직 관련 질문은 클라이언트 담당자에게 문의해 주세요. 변경 배포 시점은 백엔드 수용 완료 이후로 조율하겠습니다.
