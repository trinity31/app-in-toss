import test from 'node:test'
import assert from 'node:assert/strict'
import { purchaseTarot as runPurchase, TAROT_PRODUCT_SKU } from '../src/lib/tarotPurchase.js'

function memoryStorage() {
  const values = new Map()
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) }
}
const receiptKey = 'tarot_pending_purchase_v1'
const purchaseTarot = (grant, sdk, report, options = {}) => runPurchase(grant, sdk, report, { storage: memoryStorage(), ...options })

function iap(pending = []) {
  return {
    getPendingOrders: async () => ({ orders: pending }),
    completed: [],
    completeProductGrant: async function ({ params }) { this.completed.push(params.orderId); return true },
    createOneTimePurchaseOrder(options) { this.options = options; return () => {} },
  }
}

test('acknowledges synchronously and grants only after SDK success', async () => {
  const sdk = iap()
  const granted = []
  const buying = purchaseTarot(async id => granted.push(id), sdk)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(sdk.options.options.sku, TAROT_PRODUCT_SKU)
  assert.equal(sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
  assert.deepEqual(granted, [])
  sdk.options.onEvent({ type: 'success' })
  await buying
  assert.deepEqual(granted, ['paid'])
})

test('failed post-success grant persists receipt and recovers after reload without another checkout', async () => {
  const sdk = iap(), storage = memoryStorage()
  const buying = purchaseTarot(async () => { throw new Error('offline') }, sdk, undefined, { storage })
  const rejected = assert.rejects(buying, /offline/)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
  await sdk.options.onEvent({ type: 'success', data: { orderId: 'paid' } })
  await rejected
  assert.equal(JSON.parse(storage.getItem(receiptKey)).orderId, 'paid')
  const reloadedSDK = iap(), granted = []
  await purchaseTarot(async id => granted.push(id), reloadedSDK, undefined, { storage })
  assert.deepEqual(granted, ['paid'])
  assert.equal(reloadedSDK.options, undefined)
  assert.deepEqual(reloadedSDK.completed, [])
  assert.equal(storage.getItem(receiptKey), null)
})

test('receipt saved before acknowledgement survives termination before the success event', async () => {
  const sdk = iap(), storage = memoryStorage()
  const buying = purchaseTarot(async () => assert.fail('must not grant before success'), sdk, undefined, { storage })
  const rejected = assert.rejects(buying)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
  const reloadedSDK = iap([{ orderId: 'paid', sku: TAROT_PRODUCT_SKU }]), granted = []
  await purchaseTarot(async id => granted.push(id), reloadedSDK, undefined, { storage })
  assert.deepEqual(granted, ['paid'])
  assert.deepEqual(reloadedSDK.completed, ['paid'])
  assert.equal(reloadedSDK.options, undefined)
  await sdk.options.onError({ code: 'USER_CANCELED' })
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

test('recovers a native delivery failure by verifying the saved order without another charge', async () => {
  const sdk = iap()
  const granted = []
  const buying = purchaseTarot(async id => granted.push(id), sdk)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(await sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
  await sdk.options.onError({ code: 'PRODUCT_NOT_GRANTED_BY_PARTNER' })
  await buying
  assert.deepEqual(granted, ['paid'])
  assert.deepEqual(sdk.completed, ['paid'])
})

test('failed server verification never completes recovery and retains its receipt', async () => {
  const sdk = iap()
  const buying = purchaseTarot(async () => { throw new Error('denied') }, sdk)
  const rejected = assert.rejects(buying, /denied/)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(sdk.options.options.processProductGrant({ orderId: 'unverified' }), true)
  await sdk.options.onError({ code: 'PRODUCT_NOT_GRANTED_BY_PARTNER' })
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
  assert.ok(stages.indexOf('sdk_failed') < stages.indexOf('grant_started'))
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


test('storage failure refuses acknowledgement and makes no server grant', async () => {
  const sdk = iap(), storage = memoryStorage()
  storage.setItem = () => { throw new Error('quota exceeded') }
  const buying = purchaseTarot(async () => assert.fail('must not grant'), sdk, undefined, { storage })
  const rejected = assert.rejects(buying, /quota exceeded/)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(sdk.options.options.processProductGrant({ orderId: 'paid' }), false)
  await rejected
})

test('failed saved-order verification blocks a new checkout and keeps the receipt', async () => {
  const sdk = iap(), storage = memoryStorage()
  storage.setItem(receiptKey, JSON.stringify({ orderId: 'other-user-order', amount: 440 }))
  await assert.rejects(purchaseTarot(async () => { throw new Error('wrong buyer') }, sdk, undefined, { storage }), /wrong buyer/)
  assert.equal(sdk.options, undefined)
  assert.ok(storage.getItem(receiptKey))
})

test('duplicate success events grant once and preserve original paid amount on recovery', async () => {
  const sdk = iap(), storage = memoryStorage(), grants = []
  sdk.getProductItemList = async () => ({ products: [{ sku: TAROT_PRODUCT_SKU, displayAmount: '440원' }] })
  const buying = purchaseTarot(async (id, amount) => { grants.push([id, amount]); throw new Error('offline') }, sdk, undefined, { storage })
  const rejected = assert.rejects(buying, error => error.paymentCompleted === true)
  await new Promise(resolve => setImmediate(resolve))
  sdk.options.options.processProductGrant({ orderId: 'paid' })
  await Promise.all([sdk.options.onEvent({ type: 'success' }), sdk.options.onEvent({ type: 'success' })])
  await rejected
  assert.deepEqual(grants, [['paid', 440]])
  const reload = iap()
  reload.getProductItemList = async () => ({ products: [{ sku: TAROT_PRODUCT_SKU, displayAmount: '2,178원' }] })
  await purchaseTarot(async (id, amount) => grants.push([id, amount]), reload, undefined, { storage })
  assert.deepEqual(grants, [['paid', 440], ['paid', 440]])
  assert.equal(reload.options, undefined)
})

test('a mismatched success order cannot overwrite the original recovery receipt', async () => {
  const sdk = iap(), storage = memoryStorage()
  const buying = purchaseTarot(async () => assert.fail('must not grant'), sdk, undefined, { storage })
  const rejected = assert.rejects(buying, /일치/)
  await new Promise(resolve => setImmediate(resolve))
  sdk.options.options.processProductGrant({ orderId: 'original' })
  await sdk.options.onEvent({ type: 'success', data: { orderId: 'different' } })
  await rejected
  assert.equal(JSON.parse(storage.getItem(receiptKey)).orderId, 'original')
})

test('sandbox receipt storage does not consume the production receipt', async () => {
  const sdk = iap(), storage = memoryStorage()
  storage.setItem(receiptKey, JSON.stringify({ orderId: 'production', amount: 990 }))
  const buying = purchaseTarot(async () => {}, sdk, undefined, { storage, receiptKey: 'tarot_pending_purchase_sandbox_v1' })
  await new Promise(resolve => setImmediate(resolve))
  sdk.options.options.processProductGrant({ orderId: 'sandbox' })
  await sdk.options.onEvent({ type: 'success' })
  await buying
  assert.equal(JSON.parse(storage.getItem(receiptKey)).orderId, 'production')
})
