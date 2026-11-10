import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { realAiProxy } from './realAiProxy.local.mjs'

const origin = 'http://127.0.0.1:5190'
function harness() {
  const forwarded = []
  const middleware = realAiProxy({ origin, upstream: 'http://127.0.0.1:8020', key: 'server-only-secret', uid: 'local_test',
    fetcher: async (url, options) => { forwarded.push({ url, options }); return Response.json({ reading: 'actual upstream response' }) } })
  async function request(url, { method = 'GET', headers = {}, body } = {}) {
    const req = Readable.from(body == null ? [] : [Buffer.from(body)])
    Object.assign(req, { url, method, headers: { host: '127.0.0.1:5190', origin, ...headers } })
    const result = {}
    await middleware(req, { writeHead(status, values) { result.status = status; result.headers = values }, end(value) { result.body = JSON.parse(value) } }, () => { result.next = true })
    return result
  }
  const login = () => request('/toss-anonymous-session', { method: 'POST', body: JSON.stringify({ code: 'mock-anon-code-11111111-1111-4111-8111-111111111111' }) })
  return { request, login, forwarded }
}

test('rejects external origins, invalid hosts, missing sessions, and payment calls', async () => {
  const h = harness()
  assert.equal((await h.request('/quota', { headers: { origin: 'https://evil.test' } })).status, 403)
  assert.equal((await h.request('/quota', { headers: { host: 'evil.test:5190' } })).status, 403)
  assert.equal((await h.request('/quota')).status, 401)
  assert.equal((await h.request('/payment/deep-reading/toss-grant')).status, 403)
  assert.equal(h.forwarded.length, 0)
})

test('local proof is single-use and never returns the server credential', async () => {
  const h = harness(), session = await h.login()
  assert.equal(session.status, 200)
  assert.equal(session.body.expiresIn, 900)
  assert.equal(JSON.stringify(session).includes('server-only-secret'), false)
  assert.equal((await h.login()).status, 401)
})

test('GET and JSON always use the isolated account and strip browser credentials', async () => {
  const h = harness(), { body: session } = await h.login()
  const headers = { 'x-toss-anon-token': session.token, 'x-api-key': 'attacker', authorization: 'Bearer attacker' }
  await h.request('/quota?user_anonymous_id=victim', { headers })
  assert.equal(h.forwarded[0].url.searchParams.get('user_anonymous_id'), 'local_test')
  assert.deepEqual(h.forwarded[0].options.headers, { 'X-API-Key': 'server-only-secret' })
  const result = await h.request('/deep-reading/chat?user_anonymous_id=victim', { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ user_anonymous_id: 'victim', message: 'hello' }) })
  assert.equal(JSON.parse(h.forwarded[1].options.body).user_anonymous_id, 'local_test')
  assert.equal(h.forwarded[1].url.searchParams.has('user_anonymous_id'), false)
  assert.equal(result.body.reading, 'actual upstream response')
})

test('multipart generation is forwarded with real fields and the isolated account', async () => {
  const h = harness(), { body: session } = await h.login()
  const form = new FormData()
  form.set('name', 'local test'); form.set('user_anonymous_id', 'victim')
  const encoded = new Request(origin, { method: 'POST', body: form })
  await h.request('/deep-reading/start', { method: 'POST', headers: { 'x-toss-anon-token': session.token, 'content-type': encoded.headers.get('content-type') }, body: await encoded.text() })
  assert.equal(h.forwarded[0].options.body.get('name'), 'local test')
  assert.equal(h.forwarded[0].options.body.get('user_anonymous_id'), 'local_test')
  assert.equal(h.forwarded[0].options.headers['Content-Type'], undefined)
})

test('tarot forwards only signed local identity and its existing session capability', async () => {
  const h = harness(), { body: session } = await h.login()
  const result = await h.request('/tarot/sessions', { method: 'POST', headers: {
    'x-toss-anon-token': session.token, 'x-tarot-token': 'a'.repeat(64),
    'x-tarot-user': 'victim', 'x-tarot-deck': 'tarot78-v1', 'content-type': 'application/json',
  }, body: JSON.stringify({ id: '11111111-1111-4111-8111-111111111111', question: '고민' }) })
  assert.equal(result.status, 200)
  assert.equal(h.forwarded[0].options.headers['X-Toss-Anon-Token'], session.token)
  assert.equal(h.forwarded[0].options.headers['X-Tarot-Token'], 'a'.repeat(64))
  assert.equal(h.forwarded[0].options.headers['X-Tarot-Deck'], 'tarot78-v1')
  assert.equal(h.forwarded[0].options.headers['X-API-Key'], undefined)
  assert.equal(h.forwarded[0].options.headers['X-Tarot-User'], undefined)
  assert.equal(JSON.parse(h.forwarded[0].options.body).user_anonymous_id, undefined)
  assert.equal(session.token.split('.').length, 2)
})

test('tarot purchase routes and unrecognized commands stay blocked locally', async () => {
  const h = harness(), { body: session } = await h.login()
  for (const path of ['/tarot/sessions/11111111-1111-4111-8111-111111111111/purchase', '/tarot/sessions/admin']) {
    assert.equal((await h.request(path, { headers: { 'x-toss-anon-token': session.token } })).status, 403)
  }
  assert.equal(h.forwarded.length, 0)
})
