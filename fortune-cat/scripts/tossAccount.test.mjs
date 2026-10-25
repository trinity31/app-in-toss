import test from 'node:test'
import assert from 'node:assert/strict'
import { createTossAccountHeaders, isTossLoggedIn } from '../src/lib/tossAccount.js'
import { EntryError } from '../src/lib/entryErrors.js'

const result = { authorizationCode: 'test-code', referrer: 'SANDBOX' }
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data })

test('SDK cancellation or rejection never reaches exchange and can be retried', async () => {
  let attempts = 0
  let exchanges = 0
  const headers = createTossAccountHeaders({ baseUrl: 'https://example.test',
    appLogin: async () => { if (++attempts === 1) throw new Error('private SDK payload'); return result },
    fetcher: async () => { exchanges++; return response({ accessToken: 'test-token', expiresIn: 120, userKey: 123 }) },
  })
  await assert.rejects(headers(), e => e instanceof EntryError && e.stage === 'login' && !e.message.includes('private'))
  assert.equal(exchanges, 0)
  assert.deepEqual(await headers(), { 'X-Toss-Access-Token': 'test-token' })
  await headers()
  assert.equal(attempts, 2)
  assert.equal(exchanges, 1)
})

for (const [stage, fetcher] of [
  ['exchangeNetwork', async () => { throw new Error('private network payload') }],
  ['exchangeRejected', async () => response({ error: 'private backend payload' }, 401)],
  ['exchangeServer', async () => response({ error: 'private backend payload' }, 503)],
  ['exchangeInvalid', async () => response({ accessToken: '', expiresIn: 100 })],
  ['exchangeInvalid', async () => ({ ok: true, json: async () => { throw new Error('private JSON') } })],
]) {
  test(`exchange failure ${stage} is controlled and next attempt logs in again`, async () => {
    let attempts = 0
    let failing = true
    const headers = createTossAccountHeaders({ baseUrl: 'https://example.test',
      appLogin: async () => { attempts++; return result },
      fetcher: async (...args) => failing ? fetcher(...args) : response({ accessToken: 'test-token', expiresIn: 120, userKey: 123 }),
    })
    await assert.rejects(headers(), e => e instanceof EntryError && e.stage === stage && !e.message.includes('private'))
    failing = false
    await headers()
    assert.equal(attempts, 2)
  })
}

test('exchange sends SDK credentials and cached login refreshes at the existing expiry buffer', async () => {
  let time = 0
  let attempts = 0
  const headers = createTossAccountHeaders({ baseUrl: 'https://example.test/', now: () => time,
    appLogin: async () => { attempts++; return result },
    fetcher: async (url, options) => {
      assert.equal(url, 'https://example.test/toss-login')
      assert.deepEqual(JSON.parse(options.body), result)
      return response({ accessToken: 'test-token', expiresIn: 120, userKey: 123 })
    },
  })
  await headers()
  time = 59999
  await headers()
  assert.equal(attempts, 1)
  time = 60000
  await headers()
  assert.equal(attempts, 2)
})

for (const development of [false, true]) {
  test(`SDK rejection diagnostic is sanitized and development-only (${development})`, async () => {
    const headers = createTossAccountHeaders({ baseUrl: 'https://example.test', development,
      appLogin: async () => { throw Object.assign(new Error('private-code-and-user'), { code: 'NOT_LOGGED_IN', authorizationCode: 'private-auth' }) },
      fetcher: async () => assert.fail('must not exchange'),
    })
    await assert.rejects(headers(), error => {
      assert.equal(error.message.includes('SDK_REJECTED'), development)
      assert.equal(error.message.includes('NOT_LOGGED_IN'), development)
      assert.ok(!error.message.includes('private'))
      return true
    })
  })
}

test('malformed SDK return is distinct from native rejection without exposing result', async () => {
  const headers = createTossAccountHeaders({ baseUrl: 'https://example.test', development: true,
    appLogin: async () => ({ authorizationCode: 'private-auth' }),
    fetcher: async () => assert.fail('must not exchange'),
  })
  await assert.rejects(headers(), error => /SDK_INVALID_RESULT/.test(error.message) && !error.message.includes('private'))
})

test('unstructured native error codes are omitted', async () => {
  const headers = createTossAccountHeaders({ baseUrl: 'https://example.test', development: true,
    appLogin: async () => { throw { code: 'private user payload', name: 'private user name' } },
  })
  await assert.rejects(headers(), error => /SDK_REJECTED/.test(error.message) && !error.message.includes('private'))
})

test('login check only trusts an explicit true and never throws', async () => {
  assert.equal(await isTossLoggedIn(async () => true), true)
  assert.equal(await isTossLoggedIn(async () => false), false)
  assert.equal(await isTossLoggedIn(async () => undefined), false) // 구버전 토스 앱
  assert.equal(await isTossLoggedIn(async () => { throw new Error('bridge') }), false)
  assert.equal(await isTossLoggedIn(() => new Promise(() => {}), 10), false) // 브리지 무응답
})

const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
const accountFixture = (extra = {}) => createTossAccountHeaders({
  baseUrl: 'https://example.test', appLogin: async () => result,
  checkIntegrated: async () => true,
  fetcher: async () => response({ accessToken: 'test-token', expiresIn: 120, userKey: 123 }), ...extra,
})

test('returning account restores through one shared native check and verified exchange', async () => {
  let checks = 0; let logins = 0; let exchanges = 0; let notices = 0
  const check = deferred()
  const headers = accountFixture({ checkIntegrated: async () => { checks++; return check.promise },
    appLogin: async () => { logins++; return result },
    fetcher: async () => { exchanges++; return response({ accessToken: 'test-token', expiresIn: 120, userKey: 123 }) },
  })
  headers.subscribe(() => { notices++ })
  const first = headers.restore(); const second = headers.restore()
  check.resolve(true)
  assert.equal((await first).userId, 'toss:123')
  await second; await headers.restore()
  assert.deepEqual([checks, logins, exchanges, notices], [1, 1, 1, 1])
})

for (const value of [false, undefined, 'true', 1]) {
  test(`unlinked or unknown integration ${value} never starts interactive login`, async () => {
    let checks = 0
    const headers = accountFixture({ checkIntegrated: async () => { checks++; return value },
      appLogin: async () => assert.fail('no initial consent'),
    })
    assert.equal(await headers.restore(), null)
    assert.equal(await headers.restore(), null)
    assert.equal(checks, 1)
  })
}

for (const checkIntegrated of [undefined, async () => { throw new Error('native unavailable') }, () => new Promise(() => {})]) {
  test('unsupported, failed or timed-out integration falls back without retries', async () => {
    const headers = accountFixture({ checkIntegrated, integrationTimeoutMs: 5,
      appLogin: async () => assert.fail('no native login'),
    })
    assert.equal(await headers.restore(), null)
    assert.equal(await headers.restore(), null)
  })
}

test('failed automatic exchange stays idle while explicit login retry remains available', async () => {
  let attempts = 0
  const headers = accountFixture({ appLogin: async () => { if (++attempts === 1) throw new Error('cancelled'); return result } })
  assert.equal(await headers.restore(), null)
  assert.equal(await headers.restore(), null)
  assert.equal(attempts, 1)
  await headers()
  assert.equal(headers.getSession().userId, 'toss:123')
  assert.equal(attempts, 2)
})

for (const userKey of [undefined, null, '', '123x', {}, -1, 1.1]) {
  test('server identity must be present and valid before headers or session exist', async () => {
    const headers = accountFixture({ fetcher: async () => response({ accessToken: 'test-token', expiresIn: 120, userKey }) })
    await assert.rejects(headers(), e => e.stage === 'exchangeInvalid')
    assert.equal(headers.getSession(), null)
  })
}

test('expiry allows one fresh recovery cycle, while a valid session skips native checks', async () => {
  let time = 0; let checks = 0
  const headers = accountFixture({ now: () => time, checkIntegrated: async () => { checks++; return true } })
  await headers.restore(); await headers.restore()
  assert.equal(checks, 1)
  time = 60000
  assert.equal(headers.getSession(), null)
  await Promise.all([headers.restore(), headers.restore()])
  assert.equal(checks, 2)
  headers.clear()
  assert.equal(await headers.restore(), null)
  assert.equal(checks, 2)
  await headers()
  assert.ok(headers.getSession())
})

test('clear during native check invalidates pending automatic login', async () => {
  const check = deferred()
  const headers = accountFixture({ checkIntegrated: () => check.promise,
    appLogin: async () => assert.fail('clear cancels restoration'),
  })
  const pending = headers.restore()
  headers.clear(); check.resolve(true)
  assert.equal(await pending, null)
  assert.equal(headers.getSession(), null)
  assert.equal(await headers.restore(), null)
})

test('clear during exchange rejects stale session and permits independent manual retry', async () => {
  const exchange = deferred(); let exchanges = 0
  const headers = accountFixture({ fetcher: async () => ++exchanges === 1 ? exchange.promise
    : response({ accessToken: 'new-test-token', expiresIn: 120, userKey: 456 }) })
  const pending = headers.restore()
  while (exchanges === 0) await new Promise(resolve => setTimeout(resolve, 0))
  headers.clear()
  await headers()
  exchange.resolve(response({ accessToken: 'old-test-token', expiresIn: 120, userKey: 123 }))
  assert.equal(await pending, null)
  assert.equal(headers.getSession().userId, 'toss:456')
})

test('a fresh account instance restores without any persistent bearer credentials', async () => {
  for (let i = 0; i < 2; i++) {
    const headers = accountFixture()
    assert.equal(headers.getSession(), null)
    assert.equal((await headers.restore()).userId, 'toss:123')
  }
})

for (const stage of ['sdk', 'exchange', 'body']) {
  test(`automatic recovery is bounded when ${stage} never responds`, async t => {
    t.mock.timers.enable({ apis: ['setTimeout'] })
    const headers = accountFixture({
      appLogin: stage === 'sdk' ? () => new Promise(() => {}) : async () => result,
      fetcher: stage === 'exchange' ? () => new Promise(() => {}) : async () => stage === 'body'
        ? { ok: true, json: () => new Promise(() => {}) }
        : response({ accessToken: 'test-token', expiresIn: 120, userKey: 123 }),
    })
    const pending = headers.restore()
    // Let the native check and resolved SDK/fetch stages settle before advancing the clock.
    for (let i = 0; i < 15; i++) await Promise.resolve()
    t.mock.timers.tick(15000)
    assert.equal(await pending, null)
    assert.equal(await headers.restore(), null)
    assert.equal(headers.getSession(), null)
  })
}

test('clearing while SDK login is pending prevents any exchange afterward', async () => {
  const sdk = deferred()
  const headers = accountFixture({ appLogin: () => sdk.promise, fetcher: async () => assert.fail('stale code must not exchange') })
  const pending = headers.restore()
  for (let i = 0; i < 10; i++) await Promise.resolve()
  headers.clear(); sdk.resolve(result)
  assert.equal(await pending, null)
  assert.equal(headers.getSession(), null)
})
