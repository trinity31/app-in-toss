import test from 'node:test'
import assert from 'node:assert/strict'
import { createTossAccountHeaders, isTossLoggedIn } from '../src/lib/tossAccount.js'
import { EntryError } from '../src/lib/entryErrors.js'

const result = { authorizationCode: 'test-code', referrer: 'SANDBOX' }
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data })

test('SDK cancellation or rejection never reaches exchange and can be retried', async () => {
  let attempts = 0
  let exchanges = 0
  const headers = createTossAccountHeaders({ createAnonymousKeyAuthCode: async () => ({ code: 'test-native-code', expiresIn: 300 }), baseUrl: 'https://example.test',
    appLogin: async () => { if (++attempts === 1) throw new Error('private SDK payload'); return result },
    fetcher: async () => { exchanges++; return response({ legacyLinked: true, accessToken: 'test-token', expiresIn: 120, userKey: 123 }) },
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
  ['exchangeInvalid', async () => response({ legacyLinked: true, accessToken: '', expiresIn: 100 })],
  ['exchangeInvalid', async () => ({ ok: true, json: async () => { throw new Error('private JSON') } })],
]) {
  test(`exchange failure ${stage} is controlled and next attempt logs in again`, async () => {
    let attempts = 0
    let failing = true
    const headers = createTossAccountHeaders({ createAnonymousKeyAuthCode: async () => ({ code: 'test-native-code', expiresIn: 300 }), baseUrl: 'https://example.test',
      appLogin: async () => { attempts++; return result },
      fetcher: async (...args) => failing ? fetcher(...args) : response({ legacyLinked: true, accessToken: 'test-token', expiresIn: 120, userKey: 123 }),
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
  const headers = createTossAccountHeaders({ createAnonymousKeyAuthCode: async () => ({ code: 'test-native-code', expiresIn: 300 }), baseUrl: 'https://example.test/', now: () => time,
    appLogin: async () => { attempts++; return result },
    fetcher: async (url, options) => {
      assert.equal(url, 'https://example.test/toss-login')
      assert.deepEqual(JSON.parse(options.body), { ...result, anonymousAuthCode: 'test-native-code' })
      return response({ legacyLinked: true, accessToken: 'test-token', expiresIn: 120, userKey: 123 })
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
    const headers = createTossAccountHeaders({ createAnonymousKeyAuthCode: async () => ({ code: 'test-native-code', expiresIn: 300 }), baseUrl: 'https://example.test', development,
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
  const headers = createTossAccountHeaders({ createAnonymousKeyAuthCode: async () => ({ code: 'test-native-code', expiresIn: 300 }), baseUrl: 'https://example.test', development: true,
    appLogin: async () => ({ authorizationCode: 'private-auth' }),
    fetcher: async () => assert.fail('must not exchange'),
  })
  await assert.rejects(headers(), error => /SDK_INVALID_RESULT/.test(error.message) && !error.message.includes('private'))
})

test('unstructured native error codes are omitted', async () => {
  const headers = createTossAccountHeaders({ createAnonymousKeyAuthCode: async () => ({ code: 'test-native-code', expiresIn: 300 }), baseUrl: 'https://example.test', development: true,
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
const accountFixture = (extra = {}) => createTossAccountHeaders({ createAnonymousKeyAuthCode: async () => ({ code: 'test-native-code', expiresIn: 300 }),
  baseUrl: 'https://example.test', appLogin: async () => result,
  checkIntegrated: async () => true,
  fetcher: async () => response({ legacyLinked: true, accessToken: 'test-token', expiresIn: 120, userKey: 123 }), ...extra,
})

test('returning account restores through one shared native check and verified exchange', async () => {
  let checks = 0; let logins = 0; let exchanges = 0; let notices = 0
  const check = deferred()
  const headers = accountFixture({ checkIntegrated: async () => { checks++; return check.promise },
    appLogin: async () => { logins++; return result },
    fetcher: async () => { exchanges++; return response({ legacyLinked: true, accessToken: 'test-token', expiresIn: 120, userKey: 123 }) },
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
    const headers = accountFixture({ fetcher: async () => response({ legacyLinked: true, accessToken: 'test-token', expiresIn: 120, userKey }) })
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
    : response({ legacyLinked: true, accessToken: 'new-test-token', expiresIn: 120, userKey: 456 }) })
  const pending = headers.restore()
  while (exchanges === 0) await new Promise(resolve => setTimeout(resolve, 0))
  headers.clear()
  await headers()
  exchange.resolve(response({ legacyLinked: true, accessToken: 'old-test-token', expiresIn: 120, userKey: 123 }))
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
        : response({ legacyLinked: true, accessToken: 'test-token', expiresIn: 120, userKey: 123 }),
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

for (const acknowledgment of [undefined, false, 'true', 1]) {
  test(`unconfirmed legacy link ${acknowledgment} never publishes a session`, async () => {
    let notices = 0
    const headers = accountFixture({ fetcher: async () => response({ accessToken: 'test-token', expiresIn: 120, userKey: 123, legacyLinked: acknowledgment }) })
    headers.subscribe(() => notices++)
    assert.equal(await headers.restore(), null)
    assert.equal(headers.getSession(), null)
    assert.equal(notices, 0)
    await assert.rejects(headers(), e => e.stage === 'exchangeInvalid')
  })
}

for (const proof of [undefined, {}, { code: '' , expiresIn: 300 }, { code: '  ', expiresIn: 300 }, { code: 'x'.repeat(2049), expiresIn: 300 }, { code: 'test-code', expiresIn: 0 }, { code: 'test-code', expiresIn: '300' }]) {
  test('missing or invalid native proof cannot reach exchange', async () => {
    const headers = accountFixture({ createAnonymousKeyAuthCode: async () => proof,
      fetcher: async () => assert.fail('invalid proof must not exchange'),
    })
    await assert.rejects(headers(), e => e.stage === 'login')
    assert.equal(headers.getSession(), null)
  })
}

test('unsupported native proof fails safely without raw anonymous identity fallback', async () => {
  const headers = accountFixture({ createAnonymousKeyAuthCode: undefined, fetcher: async () => assert.fail('unsupported SDK') })
  assert.equal(await headers.restore(), null)
  await assert.rejects(headers(), e => e.stage === 'login')
})

test('every retry and expiry uses fresh login and native proof codes, single flight shares one exchange', async () => {
  let logins = 0; let proofs = 0; let exchanges = 0; let time = 0
  const headers = accountFixture({ now: () => time,
    appLogin: async () => ({ ...result, authorizationCode: `oauth-${++logins}` }),
    createAnonymousKeyAuthCode: async () => ({ code: `native-${++proofs}`, expiresIn: 300 }),
    fetcher: async (_url, options) => {
      exchanges++
      assert.deepEqual(JSON.parse(options.body), { authorizationCode: `oauth-${exchanges}`, referrer: result.referrer, anonymousAuthCode: `native-${exchanges}` })
      return exchanges === 1 ? response({}, 503) : response({ legacyLinked: true, accessToken: 'test-token', expiresIn: 120, userKey: 123 })
    },
  })
  assert.equal(await headers.restore(), null)
  await Promise.all([headers(), headers(), headers.restore()])
  assert.deepEqual([logins, proofs, exchanges], [2, 2, 2])
  time = 60000
  await Promise.all([headers.restore(), headers.restore()])
  assert.deepEqual([logins, proofs, exchanges], [3, 3, 3])
})

test('native proof rejection sanitizes errors and retry obtains fresh proof', async () => {
  let proofs = 0
  const headers = accountFixture({ createAnonymousKeyAuthCode: async () => {
    if (++proofs === 1) throw new Error('private native proof payload')
    return { code: 'test-code', expiresIn: 300 }
  } })
  await assert.rejects(headers(), e => e.stage === 'login' && !e.message.includes('private'))
  await headers()
  assert.equal(proofs, 2)
})

test('clear during native proof prevents stale exchange and account publication', async () => {
  const proof = deferred()
  const headers = accountFixture({ createAnonymousKeyAuthCode: () => proof.promise, fetcher: async () => assert.fail('stale proof must not exchange') })
  const pending = headers.restore()
  for (let i = 0; i < 20; i++) await Promise.resolve()
  headers.clear(); proof.resolve({ code: 'test-code', expiresIn: 300 })
  assert.equal(await pending, null)
  assert.equal(headers.getSession(), null)
})

test('native proof bridge timeout is bounded and cannot publish a late response', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const proof = deferred()
  const headers = accountFixture({ createAnonymousKeyAuthCode: () => proof.promise, fetcher: async () => assert.fail('timed-out proof must not exchange') })
  const pending = headers.restore()
  for (let i = 0; i < 20; i++) await Promise.resolve()
  t.mock.timers.tick(15000)
  assert.equal(await pending, null)
  proof.resolve({ code: 'test-code', expiresIn: 300 })
  for (let i = 0; i < 10; i++) await Promise.resolve()
  assert.equal(headers.getSession(), null)
})
