---
quick_id: 260818-h7t
title: 심화풀이 paywall 가격을 IAP displayAmount(콘솔 등록값)에서 조회
date: 2026-08-18
status: complete
---

# Quick Task 260818-h7t — Summary

## 목표
심화풀이 paywall의 "990원" 하드코딩을 제거하고, 가격 출처를 앱인토스 콘솔로 일원화한다.
이 수정을 배포한 뒤 콘솔에서 공급가를 바꾸면 앱 재배포 없이 반영된다.

## 배경
- 부적 결제(`AmuletPayment.jsx`)는 이미 `IAP.getProductItemList()` → SKU 매칭 → `displayAmount`
  표시 패턴이라 가격이 콘솔에 연동돼 있었으나, 심화풀이만 문구·금액이 하드코딩 상태였다.
- SDK 2.4.5의 `IapProductListItem`은 `sku / displayAmount / displayName / iconUrl / description / type`만
  제공한다. **숫자 금액 필드가 없어** grant에 보낼 금액은 `displayAmount` 파싱이 필요하다.
- 앱인토스 공식 문서에는 운영 중 상품의 가격 수정 절차가 없으나, 콘솔에서 **SKU 유지한 채
  공급가 수정이 가능**함을 확인(사용자). 따라서 SKU 교체·`.env` 변경은 불필요.

## 변경 내용
- **`src/lib/deepReadingPurchase.js`**
  - `getDeepReadingProduct()` 신규 — SKU 매칭 상품 조회. 미지원 환경/에러/미매칭 시 `null`
    반환(throw 없음, `console.warn`만) → 결제 외 흐름을 막지 않는 기존 규약 유지.
  - `parseDisplayAmount()` 신규 — `"1,200원"` → `1200`. 숫자 없으면 `null`.
  - `grantDeepReading(orderId, anonymousKey, amount)` — `amount` 파라미터 추가. 유효한 양수면
    그 값을, 아니면 `FALLBACK_AMOUNT`(990)를 전송. 기본값 처리라 하위 호환.
- **`src/components/DeepReadingResult.jsx`**
  - 마운트 시 상품 1회 조회 → `product` state + `productRef`(비동기 경합 대비).
  - `priceLabel`로 문구 3곳 치환:
    - 전체보기 버튼 → `{displayAmount}으로 전체보기 + 후속 10회 받기`
    - 후속질문 안내문 → `{displayAmount}이면 후속 질문 10회와 …`
    - 후속 결제 버튼 → `{displayAmount}으로 후속 10회 받기`
  - `priceLabel`이 없으면(개발 브라우저·구버전 토스앱) 가격 없는 문구로 표시.
  - `resolveAmount()` — 상품 조회 전에 결제/복구가 시작되면 그 자리에서 1회 조회 후 파싱.
    grant 호출 3곳(첫 결제 / 후속 결제 / 미완료 주문 복구)에 실제 결제 금액 전달.

## 검증
- `npx eslint src/components/DeepReadingResult.jsx src/lib/deepReadingPurchase.js` → 0 errors
  (레포 전체 lint의 `markdown.jsx` 에러 8건은 이번 작업과 무관한 기존 상태).
- `npm run build` → AIT 빌드 성공 (`fortune-cat.ait`).
- `grep -rn "990" src` → `FALLBACK_AMOUNT` 상수 1곳만 남음.

## 남은 작업 (사용자)
1. 이 커밋을 배포한다.
2. 배포 반영 후 앱인토스 콘솔에서 심화풀이 상품 **공급가**를 변경한다
   (400원~1,400,000원, 10원 단위, VAT 별도 → 판매가 자동 계산).
3. 토스앱에서 paywall 문구에 새 가격이 뜨는지 확인한다.

## 주의
- `FALLBACK_AMOUNT`는 IAP 조회 실패 시에만 grant에 보낼 금액이다(정상 환경에서는 쓰이지 않음).
  신규 가격에 맞춰 **4900**으로 갱신했다. 콘솔 가격을 다시 바꿀 때 이 값도 함께 맞춰야 한다.

---

## 후속 작업 — 무료 1회 공개(Phase C) 연동 (커밋 acc23c3)

### 배경
백엔드에는 무료 1회가 이미 배포돼 있었으나(`FREE_REVEAL_LIMIT=1`, `claim_free_reveal` RPC,
`POST /deep-reading/free-reveal`), **명시적 호출이 있어야만 동작**한다. `/deep-reading/start`는
`reading_remaining <= 0`이면 `is_preview=true`를 내려줄 뿐 무료를 자동 적용하지 않는다.
토스 미니앱은 이 엔드포인트 호출부가 없어 무료 1회가 적용되지 않고 있었다.

"토스 미니앱은 웹 코드를 웹뷰로 감싼 것이라 자동 적용됨"이라는 판단은 이 저장소에 맞지 않다.
이 앱은 React+Vite+TDS/AIT로 자체 번들을 빌드하는 **별도 프론트엔드**이고, 백엔드만 공유한다.

### 식별자
`user_paid_quotas.user_anonymous_id` 기준이라 토스 익명키를 그대로 받는다 → **백엔드 수정 불필요**.
다만 값의 출처가 웹(uid)과 달라 **카운터는 채널별로 분리**된다(같은 사람이 웹 1회 + 토스 1회).

### 변경 내용
- `deepReadingPurchase.js` — `freeRevealDeepReading(threadId, anonymousKey)` 추가.
  403은 무료 소진 외에 API 키/Origin 미들웨어도 반환하므로 `detail === "free_trial_used"`로 구분.
- `DeepReadingResult.jsx`
  - quota 조회를 미리보기 상태에서도 수행 → `free_reveals_used === 0`이면 `freeAvailable`
  - 미리보기 paywall에 결제 버튼 **아래 보조 버튼**으로 "무료로 전체 풀이 1회 열어보기"
    (웹앱 `saju-session.tsx:402` 배치와 동일)
  - 성공 시 전체 풀이 공개 + `followupRemaining = 0` (무료는 후속채팅 미지급 → 첫 질문에서 결제 유도)
  - 소진(403) 시 버튼 숨김 + "이미 무료 체험을 사용했어요" 토스트
  - 계측: `free_reading_started` / `free_reading_used` / `free_reading_failed`

### 검증
- eslint 0 errors, `npm run build` AIT 빌드 성공.
- 실기기 확인 필요: 무료 버튼 노출 → 전체 풀이 공개 → 재진입 시 버튼 미노출 → 후속 질문 시 결제 유도.
