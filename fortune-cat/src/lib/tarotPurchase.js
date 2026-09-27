import { parseDisplayAmount } from '../utils/displayAmount.js'

export const TAROT_PRODUCT_SKU = 'ait.0000014507.7a21835a.fa07ab6a60.0134034509'
// The console-confirmed 990-won tarot order uses this SKU in order responses.
const TAROT_PURCHASE_SKUS = new Set([
  TAROT_PRODUCT_SKU, 'ait.0000014507.eaf72598.2a019a3e97.0134075568',
])

// 매출 집계용 결제 금액 — 콘솔 등록가가 단일 출처. 조회 실패 시 null(금액 없이 지급만 진행).
async function productAmount(IAP) {
  try {
    const { products = [] } = await IAP.getProductItemList()
    return parseDisplayAmount(products.find(product => product.sku === TAROT_PRODUCT_SKU)?.displayAmount)
  } catch {
    return null
  }
}

// Persist the entitlement before acknowledging delivery to Toss.
export async function purchaseTarot(grant, suppliedIAP) {
  const IAP = suppliedIAP || (await import('@apps-in-toss/web-framework')).IAP
  const completeGrant = async orderId => {
    const completed = await IAP.completeProductGrant({ params: { orderId } })
    if (completed !== true) throw new Error('구매 복구를 완료하지 못했어요. 추가 결제 없이 다시 시도해 주세요.')
  }
  const amount = await productAmount(IAP)
  const { orders } = await IAP.getPendingOrders()
  const pending = orders.filter(order => TAROT_PURCHASE_SKUS.has(order.sku))
  if (pending.length) {
    for (const order of pending) {
      await grant(order.orderId, amount)
      await completeGrant(order.orderId)
    }
    return
  }
  return new Promise((resolve, reject) => {
    let cleanup
    let grantedOrderId
    let recovering = false
    cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku: TAROT_PRODUCT_SKU,
        processProductGrant: async ({ orderId }) => {
          try {
            await grant(orderId, amount)
            grantedOrderId = orderId
            return true
          } catch (error) {
            reject(error)
            return false
          }
        },
      },
      onEvent: event => {
        if (event.type === 'success') { cleanup?.(); resolve() }
      },
      onError: async error => {
        if (recovering) return
        recovering = true
        cleanup?.()
        // Recover only this checkout's server-confirmed grant; never start another charge.
        if (grantedOrderId) {
          try {
            await completeGrant(grantedOrderId)
            resolve()
            return
          } catch (recoveryError) {
            reject(recoveryError)
            return
          }
        }
        reject(error || new Error('결제가 취소됐어요.'))
      },
    })
  })
}
