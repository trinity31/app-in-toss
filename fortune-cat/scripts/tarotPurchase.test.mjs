import test from 'node:test'
import assert from 'node:assert/strict'
import { purchaseTarot, TAROT_PRODUCT_SKU } from '../src/lib/tarotPurchase.js'

function iap(pending = []) {
  return {
    getPendingOrders: async () => ({ orders: pending }),
    completed: [],
    completeProductGrant: async function ({ params }) { this.completed.push(params.orderId); return true },
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

test('recovers the verified promotional tarot SKU without charging again', async () => {
  const sdk = iap([
    { orderId: 'discounted-tarot', sku: 'ait.0000014507.eaf72598.2a019a3e97.0134075568' },
    { orderId: 'follow-up', sku: 'ait.0000014507.e3b46565.adb4de6495.9374700382' },
  ])
  const granted = []
  await purchaseTarot(async id => granted.push(id), sdk)
  assert.deepEqual(granted, ['discounted-tarot'])
  assert.deepEqual(sdk.completed, ['discounted-tarot'])
  assert.equal(sdk.options, undefined)
})

test('passes the console price to grant for revenue tracking', async () => {
  const sdk = { ...iap([{ orderId: 'tarot', sku: TAROT_PRODUCT_SKU }]), getProductItemList: async () => ({ products: [{ sku: TAROT_PRODUCT_SKU, displayAmount: '2,900원' }] }) }
  const granted = []
  await purchaseTarot(async (id, amount) => granted.push([id, amount]), sdk)
  assert.deepEqual(granted, [['tarot', 2900]])
})

test('recovers native delivery failure after a successful server grant without another charge', async () => {
  const sdk = iap()
  const granted = []
  const buying = purchaseTarot(async id => granted.push(id), sdk)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(await sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
  await sdk.options.onError(new Error('PRODUCT_NOT_GRANTED_BY_PARTNER'))
  await buying
  assert.deepEqual(granted, ['paid'])
  assert.deepEqual(sdk.completed, ['paid'])
})

test('never acknowledges an order when server grant failed', async () => {
  const sdk = iap()
  const buying = purchaseTarot(async () => { throw new Error('denied') }, sdk)
  const rejected = assert.rejects(buying, /denied/)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(await sdk.options.options.processProductGrant({ orderId: 'unverified' }), false)
  await sdk.options.onError(new Error('PRODUCT_NOT_GRANTED_BY_PARTNER'))
  await rejected
  assert.deepEqual(sdk.completed, [])
})

test('a false delivery acknowledgement must not report recovery success', async () => {
  const sdk = iap([{ orderId: 'paid', sku: TAROT_PRODUCT_SKU }])
  sdk.completeProductGrant = async () => false
  await assert.rejects(purchaseTarot(async () => {}, sdk), /구매 복구/)
  assert.equal(sdk.options, undefined)
})

test('diagnostics retain the native error even when recovery succeeds and exclude private payloads', async () => {
  const sdk = iap()
  const events = []
  const buying = purchaseTarot(async () => {}, sdk, event => events.push(event))
  await new Promise(resolve => setImmediate(resolve))
  await sdk.options.options.processProductGrant({ orderId: 'private-order-id' })
  await sdk.options.onError({ code: 'PRODUCT_NOT_GRANTED_BY_PARTNER', message: 'private-token', details: 'private-question' })
  await buying
  const stages = events.map(event => event.stage)
  assert.ok(stages.indexOf('grant_started') < stages.indexOf('grant_succeeded'))
  assert.ok(stages.indexOf('grant_succeeded') < stages.indexOf('grant_callback_ready'))
  assert.ok(stages.indexOf('grant_callback_ready') < stages.indexOf('sdk_failed'))
  assert.equal(stages.at(-1), 'recovery_succeeded')
  assert.equal(events.find(event => event.stage === 'sdk_failed').error_code, 'PRODUCT_NOT_GRANTED_BY_PARTNER')
  assert.equal(new Set(events.map(event => event.attempt_id)).size, 1)
  assert.ok(events.every(event => Number.isFinite(Date.parse(event.occurred_at)) && event.elapsed_ms >= 0))
  assert.ok(!JSON.stringify(events).includes('private-'))
})

test('unknown native codes are not copied into diagnostics', async () => {
  const sdk = iap()
  const events = []
  const buying = purchaseTarot(async () => {}, sdk, event => events.push(event))
  const rejected = assert.rejects(buying)
  await new Promise(resolve => setImmediate(resolve))
  await sdk.options.onError({ code: 'PRIVATE_AUTH_TOKEN', message: 'private-question' })
  await rejected
  assert.equal(events.find(event => event.stage === 'sdk_failed').error_code, 'UNKNOWN')
  assert.ok(!JSON.stringify(events).includes('PRIVATE_AUTH_TOKEN'))
  assert.ok(!JSON.stringify(events).includes('private-question'))
})

for (const report of [() => { throw new Error('analytics unavailable') }, async () => { throw new Error('analytics unavailable') }]) {
  test('diagnostic delivery failure cannot change a successful purchase', async () => {
    const sdk = iap()
    const buying = purchaseTarot(async () => {}, sdk, report)
    await new Promise(resolve => setImmediate(resolve))
    assert.equal(await sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
    sdk.options.onEvent({ type: 'success' })
    await buying
  })
}

test('pending lookup failures produce a diagnostic without opening a purchase', async () => {
  const sdk = iap()
  sdk.getPendingOrders = async () => { throw { code: 'NETWORK_ERROR' } }
  const events = []
  await assert.rejects(purchaseTarot(async () => {}, sdk, event => events.push(event)))
  assert.equal(events.at(-1).error_code, 'NETWORK_ERROR')
  assert.equal(events.at(-1).stage, 'purchase_failed')
  assert.equal(sdk.options, undefined)
})
