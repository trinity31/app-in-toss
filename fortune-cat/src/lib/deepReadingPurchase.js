// 990원 심화풀이 결제 — 토스 IAP 단건 구매 + 백엔드 quota 적립(grant).
// 부적 결제(AmuletPayment.jsx)와 동일한 IAP 패턴 재사용.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_SAJU_AI_API_KEY;
const DEEP_READING_SKU = import.meta.env.VITE_DEEP_READING_PRODUCT_SKU;

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
 * 결제 완료 후 백엔드에 quota 적립(990원 = 풀이 1 + 후속 10). orderId 멱등.
 * @returns {Promise<{success: boolean, reading_remaining?: number, followup_remaining?: number}>}
 */
export async function grantDeepReading(orderId, anonymousKey) {
  const response = await fetch(`${API_BASE_URL}/payment/deep-reading/grant`, {
    method: "POST",
    headers: { "X-API-Key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      user_anonymous_id: anonymousKey,
      amount: 990,
    }),
  });
  if (!response.ok) {
    throw new Error(`grant 실패: ${response.status}`);
  }
  return response.json();
}

/**
 * 잔여 quota 조회. { reading_remaining, followup_remaining, total_purchased }
 */
export async function getQuota(anonymousKey) {
  const response = await fetch(
    `${API_BASE_URL}/quota?user_anonymous_id=${encodeURIComponent(anonymousKey)}`,
    { headers: { "X-API-Key": API_KEY } },
  );
  if (!response.ok) {
    throw new Error(`quota 조회 실패: ${response.status}`);
  }
  return response.json();
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
