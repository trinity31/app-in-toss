import test from 'node:test'
import assert from 'node:assert/strict'
import { createDeepReadingPurchase } from '../src/lib/deepReadingPurchase.js'
const products = { deep_reading: { sku: 'reading-sku' }, followup_pack: { sku: 'followup-sku' } }
const tick = () => new Promise(resolve => setImmediate(resolve))
function setup({ pending = [], failGrant = false, complete = true, saved = null } = {}) {
  const data = new Map(saved ? [['deep_reading_pending_order', JSON.stringify(saved)]] : [])
  const storage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) }
  const calls = [], completed = []
  const sdk = { getPendingOrders: async () => ({ orders: pending }), getProductItemList: async () => ({ products: [] }), createOneTimePurchaseOrder(options) { this.options = options; return () => {} }, completeProductGrant: async ({ params }) => { completed.push(params.orderId); return complete } }
  const client = createDeepReadingPurchase({ products, storage, session: () => ({ userId: 'toss:123' }), getIAP: async () => sdk, request: async (path, options) => {
    calls.push([path, JSON.parse(options.body)])
    if (failGrant) return { ok: false, status: 409, json: async () => ({}) }
    return { ok: true, json: async () => ({ success: true, already: false, product: 'deep_reading', reading_remaining: 1, followup_remaining: 10 }) }
  } })
  return { client, sdk, data, calls, completed, storage }
}
test('deep reading persists identity/context before sync acknowledgement and posts only orderId', async () => {
  const { client, sdk, data, calls } = setup()
  const buying = client.purchase('deep_reading', { threadId: 'current' })
  await tick()
  assert.equal(sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
  assert.equal(JSON.parse(data.get('deep_reading_pending_order')).userId, 'toss:123')
  assert.equal(calls.length, 0)
  await sdk.options.onEvent({ type: 'success' })
  const result = await buying
  assert.deepEqual(calls, [['/payment/deep-reading/toss-grant', { orderId: 'paid' }]])
  assert.equal(result.grant.reading_remaining, 1)
  assert.equal(data.size, 0)
})
test('grant rejection retains receipt, blocks duplicate purchase and never completes SDK order', async () => {
  const s = setup({ saved: { orderId: 'saved', product: 'deep_reading', userId: 'toss:123' }, pending: [{ orderId: 'saved', sku: 'reading-sku' }], failGrant: true })
  await assert.rejects(s.client.purchase('deep_reading'), error => error.status === 409)
  assert.equal(s.sdk.options, undefined); assert.ok(s.data.size); assert.deepEqual(s.completed, [])
})
test('unknown SKU pending orders are ignored and never granted or acknowledged', async () => {
  const s = setup({ pending: [{ orderId: 'unknown', sku: 'unknown-sku' }] })
  assert.deepEqual(await s.client.recover(), [])
  assert.deepEqual(s.calls, []); assert.deepEqual(s.completed, [])
})
test('completion false retains durable receipt after successful grant', async () => {
  const s = setup({ pending: [{ orderId: 'paid', sku: 'reading-sku' }], complete: false })
  await assert.rejects(s.client.recover(), /복구/)
  assert.equal(JSON.parse(s.data.get('deep_reading_pending_order')).orderId, 'paid')
})
test('cancellation never grants and missing success order never clears receipts', async () => {
  const s = setup(), buying = s.client.purchase('deep_reading')
  const rejected = assert.rejects(buying)
  await tick(); await s.sdk.options.onError({ code: 'USER_CANCELED' }); await rejected
  assert.equal(s.calls.length, 0)
  const other = setup(), pending = other.client.purchase('deep_reading'), failure = assert.rejects(pending)
  await tick(); await other.sdk.options.onEvent({ type: 'success' }); await failure
  assert.equal(other.calls.length, 0)
})
test('storage failure prevents checkout and receipt from another account blocks recovery', async () => {
  const s = setup(); s.storage.setItem = () => { throw new Error('storage unavailable') }
  await assert.rejects(s.client.purchase('deep_reading'))
  assert.equal(s.sdk.options, undefined)
  const other = setup({ saved: { orderId: 'previous', userId: 'toss:456', product: 'deep_reading' } })
  await assert.rejects(other.client.recover())
  assert.equal(other.calls.length, 0); assert.ok(other.data.size)
})

test('acknowledged receipt survives restart and an already-settled retry makes no new checkout', async () => {
  const s = setup(), buying = s.client.purchase('deep_reading', { threadId: 'old-thread' })
  const failure = assert.rejects(buying)
  await tick()
  assert.equal(s.sdk.options.options.processProductGrant({ orderId: 'paid' }), true)
  const saved = JSON.parse(s.data.get('deep_reading_pending_order'))
  const restarted = setup({ saved })
  const recovered = await restarted.client.purchase('followup_pack', { threadId: 'new-thread' })
  assert.equal(recovered.recovered, true)
  assert.equal(recovered.context.threadId, 'old-thread')
  assert.equal(restarted.sdk.options, undefined)
  assert.equal(restarted.calls.length, 1)
  await s.sdk.options.onError({ code: 'USER_CANCELED' }); await failure
})
test('duplicate checkout requests and success events settle only once', async () => {
  const s = setup()
  const first = s.client.purchase('deep_reading'), second = s.client.purchase('deep_reading')
  assert.equal(first, second)
  await tick()
  s.sdk.options.options.processProductGrant({ orderId: 'paid' })
  await Promise.all([s.sdk.options.onEvent({ type: 'success' }), s.sdk.options.onEvent({ type: 'success' })])
  await first; await second
  assert.equal(s.calls.length, 1)
})
test('a grant timeout keeps receipt and same-account retry accepts already=true without another charge', async () => {
  const s = setup()
  let attempts = 0
  const client = createDeepReadingPurchase({ products, storage: s.storage, session: () => ({ userId: 'toss:123' }), getIAP: async () => s.sdk, request: async () => {
    if (++attempts === 1) throw new Error('timeout')
    return { ok: true, json: async () => ({ success: true, already: true, product: 'followup_pack', reading_remaining: 0, followup_remaining: 10 }) }
  } })
  const buying = client.purchase('followup_pack'), failure = assert.rejects(buying, /timeout/)
  await tick(); s.sdk.options.options.processProductGrant({ orderId: 'paid' }); await s.sdk.options.onEvent({ type: 'success' }); await failure
  assert.ok(s.client.pending())
  const recovered = await client.recover()
  assert.equal(recovered[0].grant.already, true)
  assert.equal(recovered[0].grant.product, 'followup_pack')
  assert.equal(s.client.pending(), null)
})

test('recovery joining an active checkout keeps its array result contract', async () => {
  const s = setup(), buying = s.client.purchase('deep_reading')
  await tick()
  const recovery = s.client.recover()
  s.sdk.options.options.processProductGrant({ orderId: 'paid' })
  await s.sdk.options.onEvent({ type: 'success' })
  assert.equal((await buying).orderId, 'paid')
  assert.deepEqual(await recovery, [])
  assert.equal(s.calls.length, 1)
})

test('checkout joining recovery returns the recovered order without another charge', async () => {
  const s = setup({ saved: { orderId: 'saved', userId: 'toss:123', product: 'deep_reading' } })
  let release
  s.sdk.getPendingOrders = () => new Promise(resolve => { release = resolve })
  const recovery = s.client.recover()
  await tick()
  const buying = s.client.purchase('followup_pack')
  release({ orders: [] })
  assert.equal((await recovery).length, 1)
  assert.equal((await buying).orderId, 'saved')
  assert.equal(s.sdk.options, undefined)
  assert.equal(s.calls.length, 1)
})
