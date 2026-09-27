import test from 'node:test'
import assert from 'node:assert/strict'
import { createTossAccountHeaders } from '../src/lib/tossAccount.js'
import { EntryError } from '../src/lib/entryErrors.js'

const result = { authorizationCode: 'test-code', referrer: 'SANDBOX' }
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data })

test('SDK cancellation or rejection never reaches exchange and can be retried', async () => {
  let attempts = 0
  let exchanges = 0
  const headers = createTossAccountHeaders({ baseUrl: 'https://example.test',
    appLogin: async () => { if (++attempts === 1) throw new Error('private SDK payload'); return result },
    fetcher: async () => { exchanges++; return response({ accessToken: 'test-token', expiresIn: 120 }) },
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
      fetcher: async (...args) => failing ? fetcher(...args) : response({ accessToken: 'test-token', expiresIn: 120 }),
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
      return response({ accessToken: 'test-token', expiresIn: 120 })
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
