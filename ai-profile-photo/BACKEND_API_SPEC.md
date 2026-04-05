# 백엔드 API 변경 요청사항

> 프론트엔드 전면 개편에 따른 백엔드 API 신규/변경 스펙입니다.

## 개편 요약

**기존**: 사진 업로드 → 타입 선택 → 광고 2회 → 1장 생성 (무료)
**신규**: 사진 업로드 → 타입 선택 → 샘플 쇼케이스 → **세트 결제** → 6장 고화질 생성

### 비즈니스 모델

- **무료 구간**: 사진 업로드 + 타입 선택 + 샘플 이미지 쇼케이스 (API 비용 0원)
- **결제 시점**: 생성 **전에** 세트 구매
- **결제 후**: 선택한 타입의 6장 세트를 고화질로 생성
- 무료 제공 없음

---

## 1. [유지] 프로필 생성 API

**`POST /api/generate-profile-photo`** — 기존 API 그대로 사용

프론트에서 결제 완료 후 6회 병렬 호출하여 세트를 생성합니다.
현재는 동일 profileType으로 6회 호출하면 AI가 매번 다른 결과를 생성하는 방식입니다.

### 향후 확장 (선택)

스타일 변형을 명시적으로 제어하려면, `styleVariation` 파라미터 추가:

```json
{
  "imageBase64": "...",
  "mimeType": "image/jpeg",
  "profileType": "professional",
  "styleVariation": "pro-a"
}
```

각 변형(pro-a ~ pro-f)에 맞는 프롬프트 변형(배경/조명/의상 등)을 적용하면
더 다양하고 예측 가능한 세트가 생성됩니다.

---

## 2. [신규] 세트 생성 API (선택 — 최적화용)

**`POST /api/generate-profile-set`**

현재는 프론트에서 기존 API를 6회 병렬 호출하지만,
네트워크 오버헤드와 결제 검증을 위해 서버 측 세트 생성 API를 추가하면 좋습니다.

### Request

```json
{
  "imageBase64": "string",
  "mimeType": "image/jpeg",
  "profileType": "professional",
  "count": 6,
  "purchaseToken": "string (인앱결제 영수증)"
}
```

### Response

```json
{
  "success": true,
  "images": [
    {
      "id": "img-uuid-1",
      "label": "스타일 A",
      "data": "string (base64, 고화질)",
      "mimeType": "image/png"
    },
    ...
  ]
}
```

### 장점

- 서버에서 결제 영수증 검증 후 생성 → 프론트 조작 방지
- 서버에서 6장 병렬 생성 → 네트워크 왕복 1회로 감소
- 이미지 Base64를 6번 전송하지 않아도 됨

---

## 3. [유지] 프로필 타입 목록 API

**`GET /api/get-profile-types`** — 변경 없음

프론트에서 연하장 타입(`new-year-card-*`)을 필터링합니다.

---

## 4. [삭제] 더 이상 사용하지 않는 항목

| 항목 | 비고 |
|------|------|
| 광고 그룹 ID (`ait.live.b1ba8a40762945e6`) | 보상형 광고 제거됨 |
| 연하장 인앱결제 SKU (`ait.0000014499...`) | 연하장 기능 제거됨 |
| 연하장 관련 API 엔드포인트 | 프론트에서 호출하지 않음 |

---

## 5. [신규] 인앱결제 상품 등록 필요

| SKU | 상품명 | 가격 | 설명 |
|-----|--------|------|------|
| `ait.profile.set.6` | AI 프로필 6장 세트 | TBD | 선택한 타입의 프로필 사진 6장 고화질 생성 |

---

## 프론트엔드 현재 상태

- **스타일 쇼케이스**: 정적 샘플 이미지 (`src/config/styleSamples.js`). 고퀄리티 샘플 이미지 제작 필요
- **결제**: 시뮬레이션 상태 (SKU 등록 + 인앱결제 SDK 연동 필요)
- **세트 생성**: `POST /api/generate-profile-set` 연동 완료 (백엔드 구현 완료)

## 구현 완료

- [x] `POST /api/generate-profile-set` — 백엔드 세트 생성 API
- [x] `api/prompts.js` — 6가지 스타일 변형 프롬프트 (골든아워, 쿨스튜디오, 자연광, 엘레건트다크, 소프트파스텔, 어반스트릿)
- [x] `vercel.json` — 세트 API 타임아웃 300초 설정
- [x] 프론트엔드 세트 API 연동

## 남은 작업

1. **인앱결제 상품 등록** (`ait.profile.set.6`) — 수익화의 전제조건
2. **타입별 고퀄리티 샘플 이미지 제작** — 스타일 쇼케이스의 핵심 (현재 placeholder)
3. **인앱결제 영수증 검증 로직** — `generate-profile-set.js`에 TODO로 표시됨
