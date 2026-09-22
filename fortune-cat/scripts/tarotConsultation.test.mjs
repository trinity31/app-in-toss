import test from 'node:test'
import assert from 'node:assert/strict'
import { createTarotConsultation, SESSION_KEY } from '../src/lib/tarotConsultation.js'

const id = '12345678-1234-4234-8234-123456789abc'
const token = 'a'.repeat(64)
const draft = { id, version: 0, question: '지금 마음이 복잡해요', answers: [], cards: [], plan: null, reading: null, clarifier: null, status: 'draft', error: null }
const ready = { ...draft, version: 1, status: 'ready', plan: { summary: draft.question, positions: ['현재 드러난 상태', '함께 살펴볼 내면 또는 다른 측면'] } }
const drawn = { ...ready, version: 2, status: 'drawn', cards: [{ id: 0 }, { id: 7 }] }
const complete = { ...drawn, version: 3, status: 'complete', reading: { answer: '살펴보세요' } }
const reply = (body, status = 200) => ({ ok: status < 400, status, json: async () => body })
function fixture(responses, saved = null) {
  let value = saved && JSON.stringify(saved)
  const calls = []
  const storage = {
    getItem: async () => value,
    setItem: async (key, data) => { assert.equal(key, SESSION_KEY); value = data },
    removeItem: async () => { value = null },
  }
  const client = createTarotConsultation({
    baseUrl: 'https://example.test', storage,
    makeCredentials: question => ({ id, token, question, created: false }),
    fetcher: async (url, options) => {
      assert.ok(value, 'credentials must be persisted before a request')
      assert.equal(options.headers['X-Tarot-Token'], token)
      calls.push({ url, ...options, data: options.body ? JSON.parse(options.body) : null })
      const next = responses.shift()
      if (next instanceof Error) throw next
      assert.ok(next, 'unexpected request')
      return next
    },
  })
  return { client, calls, storage, saved: () => JSON.parse(value) }
}

test('persists credentials before create and plans with returned version', async () => {
  const f = fixture([reply(draft), reply(ready)])
  await f.client.start(draft.question)
  assert.deepEqual(f.calls.map(c => c.url), ['https://example.test/tarot/sessions', `https://example.test/tarot/sessions/${id}/plan`])
  assert.deepEqual(f.calls[0].data, { id, question: draft.question })
  assert.deepEqual(f.calls[1].data, { version: 0 })
  assert.equal(f.saved().created, true)
  assert.equal(f.client.getSnapshot().session.status, 'ready')
})

test('uncertain creation retries the same id and secret after reload', async () => {
  const f = fixture([new Error('lost connection'), reply({}, 404), reply(draft), reply(ready)])
  await f.client.start(draft.question)
  assert.equal(f.saved().created, false)
  await f.client.retry()
  assert.equal(f.calls[2].data.id, id)
  assert.equal(f.calls[2].headers['X-Tarot-Token'], token)
  assert.equal(f.client.getSnapshot().session.status, 'ready')
})

test('storage failure prevents creating a session', async () => {
  const f = fixture([])
  f.storage.setItem = async () => { throw new Error('unavailable') }
  await f.client.start(draft.question)
  assert.equal(f.calls.length, 0)
  assert.ok(f.client.getSnapshot().error)
})

test('restore only reads saved session; interpretation retry never redraws', async () => {
  const f = fixture([reply(drawn), reply(drawn), reply(complete)], { id, token, question: draft.question, created: true })
  await f.client.restore()
  assert.deepEqual(f.client.getSnapshot().session.cards, drawn.cards)
  assert.equal(f.calls.length, 1)
  await f.client.retry()
  assert.ok(f.calls[2].url.endsWith('/interpret'))
  assert.deepEqual(f.client.getSnapshot().session.cards, drawn.cards)
})

test('double draw clicks issue one draw and one interpretation', async () => {
  const f = fixture([reply(ready), reply(drawn), reply(complete)], { id, token, question: draft.question, created: true })
  await f.client.restore()
  await Promise.all([f.client.command('draw'), f.client.command('draw')])
  assert.equal(f.calls.filter(c => c.url.endsWith('/draw')).length, 1)
  assert.equal(f.calls.filter(c => c.url.endsWith('/interpret')).length, 1)
})

test('version conflict reloads authoritative cards without drawing again', async () => {
  const f = fixture([reply(ready), reply({}, 409), reply(complete)], { id, token, question: draft.question, created: true })
  await f.client.restore()
  await f.client.command('draw')
  assert.equal(f.calls.at(-1).method, 'GET')
  assert.deepEqual(f.client.getSnapshot().session.cards, drawn.cards)
})

test('lost draw response refreshes and interprets assigned cards on retry', async () => {
  const f = fixture([reply(ready), new Error('lost response'), reply(drawn), reply(complete)], { id, token, question: draft.question, created: true })
  await f.client.restore()
  await f.client.command('draw')
  await f.client.retry()
  assert.equal(f.calls.filter(c => c.url.endsWith('/draw')).length, 1)
  assert.equal(f.calls.filter(c => c.url.endsWith('/interpret')).length, 1)
  assert.deepEqual(f.client.getSnapshot().session.cards, drawn.cards)
})

test('existing clarifier is interpreted on retry without an additional draw', async () => {
  const state = { ...complete, version: 4, status: 'clarifier_error', clarifier: { target_index: 1, card: { id: 15 }, reading: null }, error: '다시 시도해 주세요' }
  const finished = { ...state, version: 5, status: 'complete', error: null, clarifier: { ...state.clarifier, reading: { meaning: '의미' } } }
  const f = fixture([reply(state), reply(state), reply(finished)], { id, token, question: draft.question, created: true })
  await f.client.restore()
  await f.client.retry()
  assert.ok(f.calls.at(-1).url.endsWith('/interpret-clarifier'))
  assert.equal(f.client.getSnapshot().session.clarifier.card.id, 15)
  assert.deepEqual(f.client.getSnapshot().session.cards, drawn.cards)
})

test('corrupt credentials are not silently deleted', async () => {
  const f = fixture([], { id, token: 'invalid', question: '고민' })
  await f.client.restore()
  assert.ok(f.client.getSnapshot().error)
  assert.equal(f.saved().token, 'invalid')
  assert.equal(f.calls.length, 0)
})
