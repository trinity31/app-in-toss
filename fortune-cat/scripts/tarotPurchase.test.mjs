import test from 'node:test'
import assert from 'node:assert/strict'
import { purchaseTarot, TAROT_PRODUCT_SKU } from '../src/lib/tarotPurchase.js'

function iap(pending = []) {
  return {
    getPendingOrders: async () => ({ orders: pending }),
    completed: [],
    completeProductGrant: async function ({ params }) { this.completed.push(params.orderId) },
    createOneTimePurchaseOrder(options) { this.options = options; return () => {} },
  }
}

test('acknowledges only after server grant succeeds and uses the tarot product', async () => {
  const sdk = iap()
  const granted = []
  const buying = purchaseTarot(async id => granted.push(id), sdk)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(sdk.options.options.sku, TAROT_PRODUCT_SKU)
  assert.equal(await sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
  assert.deepEqual(granted, ['paid'])
  sdk.options.onEvent({ type: 'success' })
  await buying
})

test('failed grant remains unacknowledged for later recovery', async () => {
  const sdk = iap()
  const buying = purchaseTarot(async () => { throw new Error('offline') }, sdk)
  const rejected = assert.rejects(buying, /offline/)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(await sdk.options.options.processProductGrant({ orderId: 'paid' }), false)
  await rejected
})

test('recovers only tarot pending orders without opening another purchase', async () => {
  const sdk = iap([{ orderId: 'tarot', sku: TAROT_PRODUCT_SKU }, { orderId: 'saju', sku: 'other' }])
  const granted = []
  await purchaseTarot(async id => granted.push(id), sdk)
  assert.deepEqual(granted, ['tarot'])
  assert.deepEqual(sdk.completed, ['tarot'])
  assert.equal(sdk.options, undefined)
})

test('failed recovery does not start another payment or confirm delivery', async () => {
  const sdk = iap([{ orderId: 'tarot', sku: TAROT_PRODUCT_SKU }])
  await assert.rejects(purchaseTarot(async () => { throw new Error('offline') }, sdk))
  assert.deepEqual(sdk.completed, [])
  assert.equal(sdk.options, undefined)
})
