import test from 'node:test'
import assert from 'node:assert/strict'
import { createDeepReadingRequest } from '../src/lib/deepReadingAuth.js'
import { createTossAccountHeaders } from '../src/lib/tossAccount.js'
const response = data => ({ ok: true, json: async () => data })
test('personal login is single flight and exposes only canonical account identity', async () => {
  let calls = 0
  const auth = createTossAccountHeaders({ baseUrl: 'https://example.test', appLogin: async () => { calls++; return { authorizationCode: 'code', referrer: 'DEFAULT' } }, fetcher: async () => response({ accessToken: 'personal', expiresIn: 120, userKey: 123 }) })
  await Promise.all([auth(), auth()])
  assert.equal(calls, 1)
  assert.equal(auth.getSession().userId, 'toss:123')
})
test('requests never initiate login and replace supplied identities in query, JSON and FormData', async () => {
  let session = null
  const calls = []
  const request = createDeepReadingRequest({ baseUrl: 'https://example.test', session: () => session, fetcher: async (...args) => { calls.push(args); return response({}) } })
  await assert.rejects(request('/quota'), /로그인/)
  assert.equal(calls.length, 0)
  session = { userId: 'toss:123', token: 'personal' }
  await request('/quota?user_anonymous_id=attacker')
  assert.equal(new URL(calls[0][0]).searchParams.get('user_anonymous_id'), 'toss:123')
  await request('/deep-reading/chat', { method: 'POST', headers: { 'X-API-Key': 'discard', 'Content-Type': 'application/json' }, body: JSON.stringify({ user_anonymous_id: 'attacker', message: 'hello' }) })
  assert.equal(JSON.parse(calls[1][1].body).user_anonymous_id, 'toss:123')
  assert.equal(calls[1][1].headers.get('X-API-Key'), null)
  assert.equal(calls[1][1].headers.get('X-Toss-Access-Token'), 'personal')
  const form = new FormData(); form.append('user_anonymous_id', 'attacker')
  await request('/deep-reading/start', { method: 'POST', body: form })
  assert.equal(calls[2][1].body.get('user_anonymous_id'), 'toss:123')
  await assert.rejects(request('https://evil.test/deep-reading/start'), /주소/)
  await assert.rejects(request('/toss-login'), /주소/)
  assert.equal(calls.length, 3)
})
test('malformed account identity is never usable', async () => {
  const request = createDeepReadingRequest({ baseUrl: 'https://example.test', session: () => ({ userId: 'anonymous', token: 'personal' }), fetcher: async () => assert.fail('must not fetch') })
  await assert.rejects(request('/quota'), /로그인/)
})

test('a revoked token clears the session without retrying or starting login', async () => {
  let account = { userId: 'toss:123', token: 'personal' }
  let calls = 0
  const request = createDeepReadingRequest({
    baseUrl: 'https://example.test', session: () => account,
    onUnauthorized: () => { account = null },
    fetcher: async () => { calls++; return { status: 401, ok: false } },
  })
  assert.equal((await request('/quota')).status, 401)
  assert.equal(account, null)
  await assert.rejects(request('/quota'), /로그인/)
  assert.equal(calls, 1)
})

test('clearing the account notifies the login gate', async () => {
  const auth = createTossAccountHeaders({ baseUrl: 'https://example.test', appLogin: async () => ({ authorizationCode: 'code', referrer: 'DEFAULT' }), fetcher: async () => response({ accessToken: 'personal', expiresIn: 120, userKey: 123 }) })
  await auth()
  let notified = false
  const unsubscribe = auth.subscribe(() => { notified = true })
  auth.clear()
  assert.equal(notified, true)
  assert.equal(auth.getSession(), null)
  unsubscribe()
})

test('HTTP 401 suppresses automatic restoration but an explicit login can recover', async () => {
  let logins = 0
  const auth = createTossAccountHeaders({ baseUrl: 'https://example.test',
    checkIntegrated: async () => true,
    appLogin: async () => { logins++; return { authorizationCode: 'code', referrer: 'DEFAULT' } },
    fetcher: async () => response({ accessToken: 'personal', expiresIn: 120, userKey: 123 }),
  })
  await auth.restore()
  const request = createDeepReadingRequest({ baseUrl: 'https://example.test',
    session: auth.getSession, onUnauthorized: auth.clear,
    fetcher: async () => ({ status: 401, ok: false }),
  })
  assert.equal((await request('/quota')).status, 401)
  assert.equal(await auth.restore(), null)
  assert.equal(logins, 1)
  await auth()
  assert.ok(auth.getSession())
  assert.equal(logins, 2)
})
