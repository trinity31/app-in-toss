import test from 'node:test'
import assert from 'node:assert/strict'
import { createDeepReadingRequest } from '../src/lib/deepReadingAuth.js'
test('Toss grant uses a personal token and canonical UID without a shared key', async () => {
  let sent
  const request = createDeepReadingRequest({ baseUrl: 'https://backend.test', session: () => ({ userId: 'toss:123', token: 'personal' }), fetcher: async (url, options) => { sent = { url, options }; return { ok: true } } })
  await request('/payment/deep-reading/toss-grant', { method: 'POST', body: JSON.stringify({ orderId: 'paid' }) })
  assert.deepEqual(JSON.parse(sent.options.body), { orderId: 'paid', user_anonymous_id: 'toss:123' })
  assert.equal(sent.options.headers.get('X-Toss-Access-Token'), 'personal')
  assert.equal(sent.options.headers.get('X-API-Key'), null)
  await assert.rejects(request('/payment/deep-reading/grant', { method: 'POST', body: '{}' }), /주소/)
})
