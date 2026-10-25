import { authenticatedReadingFetch, getTossSession } from './tossSession.js'
export { parseDisplayAmount } from '../utils/displayAmount.js'
export const PRODUCTS = {
  deep_reading: { sku: import.meta.env?.VITE_DEEP_READING_PRODUCT_SKU },
  followup_pack: { sku: import.meta.env?.VITE_FOLLOWUP_PACK_PRODUCT_SKU },
}
const PENDING_KEY = 'deep_reading_pending_order'
const validOrder = id => typeof id === 'string' && id.length > 0 && id.length <= 200
const failure = message => new Error(message)

// The provider verifies status/SKU; the server grants each order globally once.
// Order ownership is intentionally first-claim, not proof of the original buyer.
export function createDeepReadingPurchase({ products = PRODUCTS, storage = globalThis.localStorage, session = getTossSession, request = authenticatedReadingFetch, getIAP = async () => (await import('@apps-in-toss/web-framework')).IAP } = {}) {
  let active = null
  const pending = () => {
    const raw = storage.getItem(PENDING_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { throw failure('저장된 결제 정보를 확인하지 못했어요. 문의해 주세요.') }
  }
  const save = receipt => {
    const existing = pending()
    if (existing?.orderId && existing.orderId !== receipt.orderId) throw failure('이전 결제를 먼저 복구해 주세요.')
    const encoded = JSON.stringify(receipt)
    storage.setItem(PENDING_KEY, encoded)
    if (storage.getItem(PENDING_KEY) !== encoded) throw failure('구매 복구 정보를 저장하지 못했어요.')
  }
  const remove = orderId => {
    if (pending()?.orderId !== orderId) throw failure('저장된 결제 정보가 일치하지 않아요.')
    storage.removeItem(PENDING_KEY)
    if (storage.getItem(PENDING_KEY) !== null) throw failure('구매 복구 정보를 정리하지 못했어요.')
  }
  const account = () => {
    const userId = session()?.userId
    if (!/^toss:[0-9]+$/.test(userId || '')) throw failure('다시 로그인한 뒤 결제를 진행해 주세요.')
    return userId
  }
  const productFor = sku => Object.keys(products).find(key => products[key].sku && products[key].sku === sku)
  async function grant(orderId, expectedUserId = account()) {
    if (account() !== expectedUserId) throw failure('이 결제를 시작한 계정으로 로그인해 주세요.')
    if (!validOrder(orderId)) throw failure('결제 주문 번호를 확인하지 못했어요.')
    const response = await request('/payment/deep-reading/toss-grant', { method: 'POST', body: JSON.stringify({ orderId }) })
    if (!response.ok) {
      const error = failure(response.status === 409 ? '이미 다른 계정 또는 상품에 연결된 주문이에요. 결제 내역을 보관하고 문의해 주세요.' : '결제 확인을 완료하지 못했어요. 추가 결제 없이 다시 복구해 주세요.')
      error.status = response.status
      throw error
    }
    const result = await response.json()
    if (account() !== expectedUserId) throw failure('이 결제를 시작한 계정으로 로그인해 주세요.')
    if (result?.success !== true || !Object.hasOwn(products, result.product)
      || !Number.isSafeInteger(result.reading_remaining) || result.reading_remaining < 0
      || !Number.isSafeInteger(result.followup_remaining) || result.followup_remaining < 0) throw failure('결제 지급 결과를 확인하지 못했어요. 다시 복구해 주세요.')
    return result
  }
  async function recoverWith(IAP) {
    const userId = account(), saved = pending()
    if (saved?.userId && saved.userId !== userId) throw failure('이 결제를 시작한 계정으로 로그인해 주세요.')
    if (saved?.orderId && !validOrder(saved.orderId)) throw failure('저장된 결제 정보를 확인하지 못했어요. 문의해 주세요.')
    const response = await IAP.getPendingOrders()
    const orders = Array.isArray(response) ? response : response?.orders
    if (!Array.isArray(orders)) throw failure('미완료 결제를 확인하지 못했어요. 다시 시도해 주세요.')
    const matched = orders.filter(order => productFor(order.sku) && validOrder(order.orderId))
    const recovery = saved?.orderId ? [{ ...saved }, ...matched.filter(order => order.orderId !== saved.orderId)] : matched
    if (saved && !saved.orderId && !recovery.length) throw failure('이전 결제 정보를 확인해야 해요. 문의해 주세요.')
    const results = []
    for (const order of recovery) {
      const receipt = { ...order, product: order.product || productFor(order.sku), userId }
      save(receipt)
      const result = await grant(order.orderId, userId)
      if (matched.some(item => item.orderId === order.orderId)) {
        const completed = await IAP.completeProductGrant({ params: { orderId: order.orderId } })
        if (completed !== true) throw failure('구매 복구 완료를 확인하지 못했어요. 추가 결제 없이 다시 복구해 주세요.')
      }
      remove(order.orderId)
      results.push({ orderId: order.orderId, grant: result, context: receipt.context, recovered: true })
    }
    return results
  }
  const serialized = (kind, work) => {
    if (active) {
      const current = active
      if (current.kind === kind) return current.promise
      if (kind === 'purchase') {
        // A recovered payment satisfies the click; never start a second charge.
        return current.promise.then(results => results.length ? results.at(-1) : serialized(kind, work))
      }
      // A remounted screen can recover after an earlier checkout settles or fails.
      return current.promise.then(() => serialized(kind, work), () => serialized(kind, work))
    }
    const promise = Promise.resolve().then(work).finally(() => {
      if (active?.promise === promise) active = null
    })
    active = { kind, promise }
    return promise
  }
  return {
    pending,
    grant,
    async product(product = 'deep_reading') {
      const sku = products[product]?.sku
      if (!sku) return null
      try { return (await (await getIAP()).getProductItemList()).products?.find(item => item.sku === sku) || null } catch { return null }
    },
    recover: () => serialized('recover', async () => recoverWith(await getIAP())),
    purchase: (product = 'deep_reading', context = {}) => serialized('purchase', async () => {
      const userId = account()
      const IAP = await getIAP()
      const recovered = await recoverWith(IAP)
      if (recovered.length) return recovered.at(-1)
      const sku = products[product]?.sku
      if (!sku) throw failure('결제 상품을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.')
      // Test durable storage before entering a checkout that could charge the user.
      storage.setItem(`${PENDING_KEY}:probe`, 'ready')
      if (storage.getItem(`${PENDING_KEY}:probe`) !== 'ready') throw failure('구매 복구 정보를 저장하지 못했어요.')
      storage.removeItem(`${PENDING_KEY}:probe`)
      return new Promise((resolve, reject) => {
        let cleanup, receiptOrderId, finished = false
        const receipt = orderId => ({ orderId, product, userId, context: { threadId: context.threadId || null } })
        cleanup = IAP.createOneTimePurchaseOrder({
          options: { sku, processProductGrant: ({ orderId }) => {
            if (finished) return false
            try {
              if (!validOrder(orderId) || (receiptOrderId && receiptOrderId !== orderId)) throw failure('결제 주문 정보가 일치하지 않아요.')
              save(receipt(orderId)); receiptOrderId = orderId
              return true
            } catch (error) { finished = true; cleanup?.(); reject(error); return false }
          } },
          onEvent: async event => {
            if (event.type !== 'success' || finished) return
            finished = true; cleanup?.()
            try {
              const orderId = event.data?.orderId || receiptOrderId
              if (!validOrder(orderId) || (receiptOrderId && orderId !== receiptOrderId)) throw failure('결제 주문 정보가 일치하지 않아요.')
              save(receipt(orderId))
              const result = await grant(orderId, userId)
              remove(orderId)
              resolve({ orderId, grant: result, context: receipt(orderId).context, recovered: false })
            } catch (error) { error.paymentCompleted = true; reject(error) }
          },
          onError: error => {
            if (finished) return
            finished = true; cleanup?.()
            const errorMessage = failure(receiptOrderId ? '결제 내역을 보관했어요. 추가 결제 없이 다시 복구해 주세요.' : '결제가 취소되었거나 완료되지 않았어요.')
            errorMessage.code = error?.code === 'USER_CANCELED' ? 'USER_CANCELED' : 'PURCHASE_FAILED'
            reject(errorMessage)
          },
        })
      })
    }),
  }
}
const storage = {
  getItem: key => globalThis.localStorage.getItem(key),
  setItem: (key, value) => globalThis.localStorage.setItem(key, value),
  removeItem: key => globalThis.localStorage.removeItem(key),
}
const client = createDeepReadingPurchase({ storage })
export const purchaseDeepReading = (product, context) => client.purchase(product, context)
export const recoverDeepReadingPurchases = () => client.recover()
export const getDeepReadingPending = () => client.pending()
export const getDeepReadingProduct = product => client.product(product)
export const grantDeepReading = orderId => client.grant(orderId)
async function readingAction(path, body) {
  const response = await authenticatedReadingFetch(path, { method: 'POST', body: JSON.stringify(body) })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const error = new Error('풀이를 불러오지 못했어요. 다시 시도해 주세요.')
    if (response.status === 403 && data.detail === 'free_trial_used') error.code = 'free_trial_used'
    throw error
  }
  return response.json()
}
export const freeRevealDeepReading = threadId => readingAction('/deep-reading/free-reveal', { thread_id: threadId })
export const revealDeepReading = threadId => readingAction('/deep-reading/reveal', { thread_id: threadId })
export async function getQuota() {
  const response = await authenticatedReadingFetch('/quota')
  if (!response.ok) throw new Error('이용 횟수를 확인하지 못했어요. 다시 시도해 주세요.')
  return response.json()
}
