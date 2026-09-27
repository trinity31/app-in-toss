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

// Keep a receipt before acknowledging; grant on SDK success after checkout closes.
export async function purchaseTarot(grant, suppliedIAP, onDiagnostic, { storage = globalThis.localStorage, receiptKey = 'tarot_pending_purchase_v1' } = {}) {
  const report = createPaymentDiagnosticReporter(onDiagnostic)
  report('started')
  try {
    return await runPurchase(grant, suppliedIAP, report, storage, receiptKey)
  } catch (error) {
    report('purchase_failed', error)
    throw error
  }
}

async function runPurchase(grant, suppliedIAP, report, storage, receiptKey) {
  const rawReceipt = storage.getItem(receiptKey)
  const saved = rawReceipt ? JSON.parse(rawReceipt) : null
  const validOrder = id => typeof id === 'string' && id.length > 0 && id.length <= 200
  if (saved && !validOrder(saved.orderId)) throw new Error('저장된 결제 정보를 확인하지 못했어요. 문의해 주세요.')
  const saveReceipt = (orderId, amount) => {
    if (!validOrder(orderId)) throw new Error('결제 주문 번호를 확인하지 못했어요.')
    const value = JSON.stringify({ orderId, amount })
    storage.setItem(receiptKey, value)
    if (storage.getItem(receiptKey) !== value) throw new Error('구매 복구 정보를 저장하지 못했어요.')
  }
  const clearReceipt = () => storage.removeItem(receiptKey)
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
  // A completed SDK order may no longer appear in getPendingOrders.
  const recovery = saved
    ? [{ orderId: saved.orderId, amount: saved.amount ?? amount }, ...pending.filter(order => order.orderId !== saved.orderId)]
    : pending
  if (recovery.length) {
    for (const order of recovery) {
      await grantOrder(order.orderId, order.amount ?? amount)
      if (pending.some(item => item.orderId === order.orderId)) await completeGrant(order.orderId)
      if (saved?.orderId === order.orderId) clearReceipt()
    }
    return
  }
  return new Promise((resolve, reject) => {
    let cleanup
    let receiptOrderId
    let finishing = false
    report('checkout_started')
    cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku: TAROT_PRODUCT_SKU,
        processProductGrant: ({ orderId }) => {
          try {
            saveReceipt(orderId, amount)
            receiptOrderId = orderId
            report('grant_callback_ready')
            return true
          } catch (error) {
            cleanup?.()
            reject(error)
            return false
          }
        },
      },
      onEvent: async event => {
        if (event.type !== 'success' || finishing) return
        finishing = true
        report('sdk_succeeded')
        cleanup?.()
        try {
          const orderId = event.data?.orderId || receiptOrderId
          if (receiptOrderId && orderId !== receiptOrderId) throw new Error('결제 주문 정보가 일치하지 않아요.')
          saveReceipt(orderId, amount)
          await grantOrder(orderId, amount)
          clearReceipt()
          resolve()
        } catch (error) {
          error.paymentCompleted = true
          reject(error)
        }
      },
      onError: async error => {
        if (finishing) return
        finishing = true
        report('sdk_failed', error || new Error('Unknown SDK error'))
        cleanup?.()
        // Only recover a delivery error after validating and persisting the server grant.
        if (receiptOrderId && error?.code === 'PRODUCT_NOT_GRANTED_BY_PARTNER') {
          try {
            await grantOrder(receiptOrderId, amount)
            await completeGrant(receiptOrderId)
            clearReceipt()
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
