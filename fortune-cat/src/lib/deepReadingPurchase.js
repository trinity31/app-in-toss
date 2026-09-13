// 심화풀이 결제 — 토스 IAP 단건 구매 + 백엔드 quota 적립(grant).
// 가격은 앱인토스 콘솔 등록값(getProductItemList의 displayAmount)이 단일 출처.
// 부적 결제(AmuletPayment.jsx)와 동일한 IAP 패턴 재사용.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_SAJU_AI_API_KEY;
const DEEP_READING_SKU = import.meta.env.VITE_DEEP_READING_PRODUCT_SKU;

// IAP 상품 조회 실패(개발 브라우저·구버전 토스앱) 시 grant에 보낼 폴백 금액
const FALLBACK_AMOUNT = 4900;

/**
 * 콘솔에 등록된 심화풀이 상품 정보를 조회한다. 가격 표기(displayAmount)의 단일 출처.
 * IAP 미지원 환경(개발 브라우저·구버전 토스앱)이나 조회 실패 시 null — throw 하지 않는다.
 * @returns {Promise<{sku: string, displayAmount: string, displayName: string} | null>}
 */
export async function getDeepReadingProduct() {
  if (!DEEP_READING_SKU) {
    console.warn("[deepReadingPurchase] VITE_DEEP_READING_PRODUCT_SKU 미설정");
    return null;
  }
  try {
    const { IAP } = await import("@apps-in-toss/web-framework");
    const response = await IAP.getProductItemList();
    const products = response?.products ?? [];
    return products.find((p) => p.sku === DEEP_READING_SKU) || null;
  } catch (e) {
    console.warn("[deepReadingPurchase] 상품 정보 조회 실패:", e);
    return null;
  }
}

/**
 * displayAmount("1,200원")에서 숫자 금액만 추출한다. SDK가 숫자 필드를 주지 않아 파싱이 필요.
 * @returns {number|null} 파싱 실패 시 null
 */
export function parseDisplayAmount(displayAmount) {
  const digits = String(displayAmount ?? "").replace(/[^0-9]/g, "");
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

// 결제 성공 후 서버 지급 실패 시 복구용 — 보류 주문 컨텍스트(thread_id 등) 로컬 저장
const PENDING_KEY = "deep_reading_pending_order";

export function saveDeepReadingPending(ctx) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(ctx));
  } catch (e) {
    console.warn("[deepReadingPurchase] pending 저장 실패:", e);
  }
}

export function getDeepReadingPending() {
  try {
    const s = localStorage.getItem(PENDING_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export function clearDeepReadingPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch (e) {
    console.warn("[deepReadingPurchase] pending 삭제 실패:", e);
  }
}

/** 결제됐지만 미완료(서버 지급 실패)된 심화풀이 주문 목록. */
export async function getPendingDeepReadingOrders() {
  const { IAP } = await import("@apps-in-toss/web-framework");
  const response = await IAP.getPendingOrders();
  const orders = Array.isArray(response)
    ? response
    : response?.orders || response?.pendingOrders || [];
  console.log("[deepReadingPurchase] pending orders:", JSON.stringify(orders));
  const matched = orders.filter((o) => {
    const sku = o?.sku || o?.productId || o?.productSku || o?.product?.sku || o?.productCode;
    return sku === DEEP_READING_SKU; // 심화풀이 SKU 매칭
  });
  // SKU 필드명이 예상과 달라 매칭 0건이면 전체로 폴백(복구 우선)
  return matched.length ? matched : orders;
}

/** 복구 지급 완료를 토스에 통지 (보류 주문 정리). */
export async function completeDeepReadingGrant(orderId) {
  try {
    const { IAP } = await import("@apps-in-toss/web-framework");
    await IAP.completeProductGrant({ params: { orderId } });
  } catch (e) {
    console.warn("[deepReadingPurchase] completeProductGrant 실패:", e);
  }
}

/**
 * 토스 IAP 단건 결제를 실행한다.
 * @returns {Promise<{orderId: string}>} 결제 성공 시 orderId. 취소/실패 시 reject.
 */
export async function purchaseDeepReading() {
  const sku = DEEP_READING_SKU;
  if (!sku) {
    throw new Error("VITE_DEEP_READING_PRODUCT_SKU 미설정");
  }
  const { IAP } = await import("@apps-in-toss/web-framework");

  return new Promise((resolve, reject) => {
    let cleanup;
    cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku,
        // 결제 성공 시 즉시 true (백엔드 적립은 onEvent success에서 grant 호출)
        processProductGrant: () => true,
      },
      onEvent: (event) => {
        if (event.type === "success") {
          cleanup?.();
          resolve({ orderId: event.data?.orderId });
        }
      },
      onError: (error) => {
        cleanup?.();
        reject(error || new Error("purchase_failed"));
      },
    });
  });
}

/**
 * 결제 완료 후 백엔드에 quota 적립(1회 결제 = 풀이 1 + 후속 10). orderId 멱등.
 * @param {number} [amount] 실제 결제 금액(콘솔 displayAmount 파싱값). 없으면 FALLBACK_AMOUNT.
 * @returns {Promise<{success: boolean, reading_remaining?: number, followup_remaining?: number}>}
 */
export async function grantDeepReading(orderId, anonymousKey, amount) {
  const response = await fetch(`${API_BASE_URL}/payment/deep-reading/grant`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      user_anonymous_id: anonymousKey,
      amount: Number.isFinite(amount) && amount > 0 ? amount : FALLBACK_AMOUNT,
    }),
  });
  if (!response.ok) {
    throw new Error(`grant 실패: ${response.status}`);
  }
  return response.json();
}

/**
 * 심화풀이 무료 1회 공개 (백엔드 Phase C). 결제 없이 전체 풀이만 열고,
 * reading/followup 크레딧은 지급되지 않는다(후속채팅은 유료 유지).
 * 계정(=user_anonymous_id)당 1회로 백엔드가 원자적으로 제한한다.
 * @throws {Error & {code?: string}} 무료 1회 소진 시 code === "free_trial_used"
 * @returns {Promise<object>} DeepReadingStartResponse 형태(전체 reading/summary/follow_up_questions).
 */
export async function freeRevealDeepReading(threadId, anonymousKey) {
  const response = await fetch(`${API_BASE_URL}/deep-reading/free-reveal`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: threadId,
      user_anonymous_id: anonymousKey,
    }),
  });
  if (response.status === 403) {
    // 403은 무료 소진(detail: "free_trial_used") 외에 API 키/Origin 미들웨어도 반환한다.
    // detail로 구분해야 인증 오류를 "이미 사용함"으로 오인하지 않는다.
    const body = await response.json().catch(() => ({}));
    if (body?.detail === "free_trial_used") {
      const err = new Error("free_trial_used");
      err.code = "free_trial_used";
      throw err;
    }
    throw new Error(`무료 공개 거부됨: ${body?.detail || "forbidden"}`);
  }
  if (!response.ok) {
    throw new Error(`무료 공개 실패: ${response.status}`);
  }
  return response.json();
}

/**
 * 개발 빌드 전용 quota 오버라이드 — 결제 상태별 화면(무료 공개 버튼, 보유 크레딧,
 * 연애상담 무료 질문 배너, 후속 paywall)을 실제 결제·DB 수정 없이 확인하기 위한 장치.
 *
 * `.env.development`에 아래처럼 넣는다(일부 필드만 써도 된다, 나머지는 서버 값 유지):
 *   VITE_DEBUG_QUOTA={"total_purchased":0,"free_reveals_used":0,"free_followups_used":0}
 *
 * `import.meta.env.DEV` 가드 안에 있어 프로덕션 빌드에서는 제거된다.
 * ⚠️ 화면 표시만 바꾼다 — 백엔드는 실제 계정 상태로 동작하므로 무료 공개는 403,
 * 무료 질문은 유료 처리될 수 있다. 문구·레이아웃 확인용이다.
 */
function applyDebugQuota(quota) {
  if (!import.meta.env.DEV) return quota;
  const raw = import.meta.env.VITE_DEBUG_QUOTA;
  if (!raw) return quota;
  try {
    const merged = { ...quota, ...JSON.parse(raw) };
    console.warn("[deepReadingPurchase] VITE_DEBUG_QUOTA 적용:", merged);
    return merged;
  } catch (e) {
    console.warn("[deepReadingPurchase] VITE_DEBUG_QUOTA 파싱 실패:", e);
    return quota;
  }
}

/**
 * 잔여 quota 조회. { reading_remaining, followup_remaining, total_purchased, free_reveals_used }
 */
export async function getQuota(anonymousKey) {
  const response = await fetch(
    `${API_BASE_URL}/quota?user_anonymous_id=${encodeURIComponent(anonymousKey)}`,
    { headers: { "X-API-Key": API_KEY } },
  );
  if (!response.ok) {
    throw new Error(`quota 조회 실패: ${response.status}`);
  }
  return applyDebugQuota(await response.json());
}

/**
 * 결제 후 미리보기 → 캐시된 전체풀이 공개(재생성 없음). reading quota 1 소진.
 * @returns {Promise<object>} DeepReadingStartResponse 형태(전체 reading/summary/follow_up_questions).
 */
export async function revealDeepReading(threadId, anonymousKey) {
  const response = await fetch(`${API_BASE_URL}/deep-reading/reveal`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: threadId,
      user_anonymous_id: anonymousKey,
    }),
  });
  if (!response.ok) {
    throw new Error(`reveal 실패: ${response.status}`);
  }
  return response.json();
}
