import test from 'node:test'
import assert from 'node:assert/strict'
import { tarotRuntime } from '../src/lib/tarotRuntime.js'
import { createTarotConsultation, SESSION_KEY } from '../src/lib/tarotConsultation.js'

test('only local development sandbox uses isolated payments and storage', () => {
  const baseUrl = 'http://192.168.35.170:8000'
  for (const development of [true, false]) for (const sandbox of [true, false]) {
    const runtime = tarotRuntime({ development, sandbox, baseUrl })
    assert.equal(runtime.baseUrl, development && sandbox ? 'http://192.168.35.170:8001/sandbox' : baseUrl)
    assert.equal(runtime.sessionKey, development && sandbox ? `${SESSION_KEY}_SANDBOX` : SESSION_KEY)
  }
  for (const baseUrl of [undefined, 'https://saju.trinity-apps.net', 'invalid']) {
    assert.equal(tarotRuntime({ development: true, sandbox: true, baseUrl }).baseUrl, null)
  }
})

test('sandbox restore and reset leave production session untouched', async () => {
  const runtime = tarotRuntime({ development: true, sandbox: true, baseUrl: 'http://localhost:8000' })
  const stored = new Map([[SESSION_KEY, 'original production data']])
  const client = createTarotConsultation({ ...runtime, storage: {
    getItem: async key => stored.get(key),
    setItem: async (key, value) => stored.set(key, value),
    removeItem: async key => stored.delete(key),
  }, fetcher: async () => { throw new Error('Must not read production session') } })
  await client.restore()
  assert.equal(client.getSnapshot().hasSaved, false)
  await client.reset()
  assert.equal(stored.get(SESSION_KEY), 'original production data')
})
