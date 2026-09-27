import test from 'node:test'
import assert from 'node:assert/strict'
import { createTarotLibrary } from '../src/lib/tarotLibrary.js'

test('library uses authenticated read-only paged requests without overwriting active session', async () => {
  const calls = []
  const client = createTarotLibrary({ baseUrl: 'http://localhost:8001/sandbox', accountHeaders: async () => ({ 'X-Toss-Access-Token': 'test' }),
    fetcher: async (url, options) => {
      calls.push({ url, options })
      return { ok: true, json: async () => url.includes('?') ? { items: [{ id: 'saved' }], has_more: true } : { id: 'saved', cards: [], reading: { answer: 'saved answer' } } }
    },
  })
  assert.equal((await client.list(50)).has_more, true)
  assert.equal((await client.detail('saved')).reading.answer, 'saved answer')
  assert.equal(calls[0].url, 'http://localhost:8001/sandbox/tarot/sessions/history?offset=50')
  assert.equal(calls[1].url, 'http://localhost:8001/sandbox/tarot/sessions/history/saved')
  for (const { options } of calls) {
    assert.equal(options.method, undefined)
    assert.equal(options.body, undefined)
    assert.equal(options.headers['X-Toss-Access-Token'], 'test')
    assert.equal(options.headers['X-Tarot-Deck'], 'tarot78-v1')
  }
})

test('library exposes request failure and rejects mismatched details', async () => {
  let success = false
  const client = createTarotLibrary({ baseUrl: 'http://localhost:8001/sandbox', accountHeaders: async () => ({}), fetcher: async () => ({ ok: success, json: async () => ({ id: 'other', cards: [], reading: {} }) }) })
  await assert.rejects(client.list(), /다시 시도/)
  success = true
  await assert.rejects(client.detail('expected'), /확인하지/)
})
