import { parseDisplayAmount } from '../utils/displayAmount.js'
import { createPaymentDiagnosticReporter } from './tarotPaymentDiagnostic.js'

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
export async function purchaseTarot(grant, suppliedIAP, onDiagnostic) {
  const report = createPaymentDiagnosticReporter(onDiagnostic)
  report('started')
  try {
    return await runPurchase(grant, suppliedIAP, report)
  } catch (error) {
    report('purchase_failed', error)
    throw error
  }
}

async function runPurchase(grant, suppliedIAP, report) {
  const IAP = suppliedIAP || (await import('@apps-in-toss/web-framework')).IAP
  const grantOrder = async (orderId, amount) => {
    report('grant_started')
    try {
      await grant(orderId, amount)
      report('grant_succeeded')
    } catch (error) {
      report('grant_failed', error)
      throw error
    }
  }
  const completeGrant = async orderId => {
    report('recovery_started')
    try {
      const completed = await IAP.completeProductGrant({ params: { orderId } })
      if (completed !== true) {
        const error = new Error('구매 복구를 완료하지 못했어요. 추가 결제 없이 다시 시도해 주세요.')
        error.code = 'RECOVERY_NOT_CONFIRMED'
        throw error
      }
      report('recovery_succeeded')
    } catch (error) {
      report('recovery_failed', error)
      throw error
    }
  }
  const amount = await productAmount(IAP)
  report('pending_lookup_started')
  const { orders } = await IAP.getPendingOrders()
  report('pending_lookup_succeeded')
  const pending = orders.filter(order => TAROT_PURCHASE_SKUS.has(order.sku))
  if (pending.length) {
    for (const order of pending) {
      await grantOrder(order.orderId, amount)
      await completeGrant(order.orderId)
    }
    return
  }
  return new Promise((resolve, reject) => {
    let cleanup
    let grantedOrderId
    let recovering = false
    report('checkout_started')
    cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku: TAROT_PRODUCT_SKU,
        processProductGrant: async ({ orderId }) => {
          try {
            await grantOrder(orderId, amount)
            grantedOrderId = orderId
            report('grant_callback_ready')
            return true
          } catch (error) {
            reject(error)
            return false
          }
        },
      },
      onEvent: event => {
        if (event.type === 'success') { report('sdk_succeeded'); cleanup?.(); resolve() }
      },
      onError: async error => {
        if (recovering) return
        recovering = true
        report('sdk_failed', error || new Error('Unknown SDK error'))
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
