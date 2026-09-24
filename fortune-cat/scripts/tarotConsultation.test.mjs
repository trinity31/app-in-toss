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
function fixture(responses, saved = null, purchase) {
  let value = saved && JSON.stringify(saved)
  const calls = []
  const storage = {
    getItem: async () => value,
    setItem: async (key, data) => { assert.equal(key, SESSION_KEY); value = data },
    removeItem: async () => { value = null },
  }
  const client = createTarotConsultation({
    baseUrl: 'https://example.test', storage, purchase,
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

test('exhausted trial restores the account consultation after storage reset', async () => {
  const previousId = '22345678-1234-4234-8234-123456789abc'
  const previous = { ...complete, id: previousId, question: '이전 고민' }
  const f = fixture([reply({}, 402), reply(previous)])
  await f.client.start('새 고민')
  assert.equal(f.calls[1].url, 'https://example.test/tarot/sessions/free')
  assert.equal(f.saved().id, previousId)
  assert.equal(f.saved().question, '이전 고민')
  assert.equal(f.saved().created, true)
  assert.equal(f.client.getSnapshot().session.id, previousId)
  assert.match(f.client.getSnapshot().error, /이전 상담/)
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

test('a storage read failure cannot overwrite a potentially existing consultation', async () => {
  const f = fixture([])
  f.storage.getItem = async () => { throw new Error('temporarily unavailable') }
  await f.client.restore()
  await f.client.start('다른 고민')
  assert.equal(f.calls.length, 0)
  assert.equal(f.client.getSnapshot().restoreFailed, true)
})

test('answer is saved before replanning, with each returned version used', async () => {
  const question = { ...draft, version: 1, status: 'question', pending_question: { question: '어떤 고민인가요?', options: [] } }
  const answered = { ...draft, version: 2, answers: [{ question: '어떤 고민인가요?', answer: '이직 준비를 시작할지 고민이에요' }] }
  const f = fixture([reply(question), reply(answered), reply({ ...ready, version: 3 })], { id, token, question: draft.question, created: true })
  await f.client.restore()
  await f.client.command('answer', { answer: answered.answers[0].answer })
  assert.deepEqual(f.calls[1].data, { version: 1, answer: answered.answers[0].answer })
  assert.deepEqual(f.calls[2].data, { version: 2 })
  assert.ok(f.calls[2].url.endsWith('/plan'))
})

test('clarifier draw is followed by its interpretation and preserves original reading', async () => {
  const clarified = { ...complete, version: 4, status: 'clarifier_drawn', clarifier: { target_index: 1, card: { id: 15 }, reading: null } }
  const finished = { ...clarified, version: 5, status: 'complete', clarifier: { ...clarified.clarifier, reading: { meaning: '보충' } } }
  const f = fixture([reply(complete), reply(clarified), reply(finished)], { id, token, question: draft.question, created: true })
  await f.client.restore()
  await Promise.all([f.client.command('clarify', { target_index: 1 }), f.client.command('clarify', { target_index: 1 })])
  assert.deepEqual(f.calls[1].data, { version: 3, target_index: 1 })
  assert.ok(f.calls[2].url.endsWith('/interpret-clarifier'))
  assert.deepEqual(f.client.getSnapshot().session.reading, complete.reading)
  assert.deepEqual(f.client.getSnapshot().session.cards, complete.cards)
})

test('an answer lost before reaching the server is resent only at the same version', async () => {
  const question = { ...draft, version: 1, status: 'question', pending_question: { question: '무엇이 궁금한가요?', options: [] } }
  const f = fixture([reply(question), new Error('offline'), reply(question), reply({ ...draft, version: 2 }), reply({ ...ready, version: 3 })], { id, token, question: draft.question, created: true })
  await f.client.restore()
  await f.client.command('answer', { answer: '현재 마음' })
  await f.client.retry()
  assert.deepEqual(f.calls[3].data, { version: 1, answer: '현재 마음' })
  assert.equal(f.client.getSnapshot().session.status, 'ready')
})


test('paid consultation grants before drawing and ignores double payment clicks', async () => {
  const paywall = { ...ready, payment_required: true }
  let purchases = 0
  const f = fixture([reply(paywall), reply(paywall), reply({ ...ready, payment_required: false }), reply(ready), reply(drawn), reply(complete)],
    { id, token, question: draft.question, created: true },
    async grant => { purchases++; await grant('order', 2900) })
  await f.client.restore()
  await Promise.all([f.client.pay(), f.client.pay()])
  assert.equal(purchases, 1)
  assert.equal(f.calls[2].data.orderId, 'order')
  assert.equal(f.calls[2].data.amount, 2900)
  assert.ok(f.calls[2].url.endsWith('/purchase'))
  assert.equal(f.client.getSnapshot().session.status, 'complete')
})

test('already granted purchase resumes without paying again after reload', async () => {
  let purchases = 0
  const f = fixture([reply({ ...ready, payment_required: false }), reply(ready), reply(ready), reply(drawn), reply(complete)],
    { id, token, question: draft.question, created: true }, async () => { purchases++ })
  await f.client.restore()
  await f.client.pay()
  assert.equal(purchases, 0)
  assert.equal(f.client.getSnapshot().session.status, 'complete')
})

test('canceled purchase preserves the concern and draws no cards', async () => {
  const paywall = { ...ready, payment_required: true }
  const f = fixture([reply(paywall), reply(paywall)],
    { id, token, question: draft.question, created: true }, async () => { throw new Error('canceled') })
  await f.client.restore()
  await f.client.pay()
  assert.equal(f.calls.length, 2)
  assert.equal(f.client.getSnapshot().session.question, draft.question)
  assert.deepEqual(f.client.getSnapshot().session.cards, [])
  assert.match(f.client.getSnapshot().error, /결제/)
})
