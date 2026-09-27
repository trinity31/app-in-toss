import { EntryError } from './entryErrors.js'

export const SESSION_KEY = 'FORTUNE_CAT_TAROT_CONSULTATION'

const randomHex = length => Array.from(crypto.getRandomValues(new Uint8Array(length)), byte => byte.toString(16).padStart(2, '0')).join('')

// crypto.randomUUID 는 보안 컨텍스트(https)에서만 있어 http 개발 서버에서 실패하므로 getRandomValues 로 v4 UUID 를 만든다.
function uuidV4() {
  const hex = randomHex(16)
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function newCredentials(question) {
  return {
    id: uuidV4(),
    token: randomHex(32),
    question,
    created: false,
  }
}

function validCredentials(value) {
  return value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.id)
    && /^[a-f0-9]{64}$/.test(value.token)
    && typeof value.question === 'string' && value.question.trim().length > 0
    && typeof value.created === 'boolean'
}

export function continuation(session) {
  if (!session) return null
  if (['draft', 'planning_error'].includes(session.status)) return 'plan'
  if (session.clarifier && !session.clarifier.reading) return 'interpret-clarifier'
  if (session.cards.length && !session.reading) return 'interpret'
  return null
}

// Keep mutations and their recovery in one place so a lost response never means a new draw.
export function createTarotConsultation({ baseUrl, storage, fetcher = fetch, makeCredentials = newCredentials, purchase, accountHeaders = async () => ({}) }) {
  let credentials = null
  let active = null
  let pending = null
  let snapshot = { session: null, busy: false, error: null, initialized: false, hasSaved: false, restoreFailed: false, invalidSaved: false }
  const listeners = new Set()
  const update = values => {
    snapshot = { ...snapshot, ...values }
    listeners.forEach(listener => listener())
  }

  async function request(path, body) {
    if (!baseUrl) throw new EntryError('configuration')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 110000)
    try {
      const response = await fetcher(`${baseUrl.replace(/\/$/, '')}/tarot/sessions${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', 'X-Tarot-Token': credentials.token, ...await accountHeaders() },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
      })
      if (!response.ok) {
        const error = new EntryError(response.status >= 500 ? 'server'
          : response.status === 402 ? 'quota'
          : response.status === 404 ? 'missing' : 'request')
        if (response.status === 402 && snapshot.session) {
          update({ session: { ...snapshot.session, payment_required: true } })
        }
        error.status = response.status
        throw error
      }
      let session
      try { session = await response.json() }
      catch { throw new EntryError('response') }
      if (!session || (path !== '/free' && session.id !== credentials.id) || !Number.isInteger(session.version) || !Array.isArray(session.cards)) {
        throw new EntryError('response')
      }
      if (path === '/free') credentials = { ...credentials, id: session.id, question: session.question }
      update({ session, error: null })
      return session
    } finally {
      clearTimeout(timer)
    }
  }

  async function writeCredentials(value) {
    try { await storage.setItem(SESSION_KEY, JSON.stringify(value)) }
    catch { throw new EntryError('storageWrite') }
  }

  async function create() {
    let session
    try {
      session = await request('', { id: credentials.id, question: credentials.question })
    } catch (error) {
      if (error.status !== 402) throw error
      session = await request('/free')
      update({ error: '무료 상담 1회를 사용해 이전 상담을 불러왔어요. 이 상담의 결과와 확인 카드는 계속 이용할 수 있어요.' })
    }
    credentials = { ...credentials, created: true }
    await writeCredentials(credentials)
    return session
  }

  async function refresh() {
    try {
      return await request(`/${credentials.id}`)
    } catch (error) {
      if (error.status === 404 && !credentials.created) return create()
      throw error
    }
  }

  async function mutate(action, data = {}) {
    return request(`/${credentials.id}/${action}`, { version: snapshot.session.version, ...data })
  }

  async function advance() {
    const action = continuation(snapshot.session)
    if (action) await mutate(action)
  }

  function run(work) {
    if (active) return active
    update({ busy: true, error: null })
    active = Promise.resolve().then(work).catch(async error => {
      if (error.status === 409 && credentials) {
        try {
          await refresh()
          pending = null
          return
        } catch {
          // Retain the current cards if refresh also fails.
        }
      }
      update({ error: error instanceof EntryError ? error.message : '연결이 원활하지 않아요. 입력과 뽑은 카드는 유지되니 다시 시도해 주세요.' })
    }).finally(() => {
      active = null
      update({ busy: false, initialized: true })
    })
    return active
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    restore() {
      return run(async () => {
        update({ restoreFailed: true })
        let raw
        try { raw = await storage.getItem(SESSION_KEY) }
        catch { throw new EntryError('storageRead') }
        update({ restoreFailed: false })
        if (!raw) return
        update({ hasSaved: true })
        let parsed
        try { parsed = JSON.parse(raw) } catch { /* Invalid data remains until the user starts over. */ }
        if (!validCredentials(parsed)) {
          update({ invalidSaved: true })
          throw new EntryError('invalidSaved')
        }
        credentials = parsed
        await refresh()
      })
    },
    start(question) {
      return run(async () => {
        if (credentials || snapshot.hasSaved || snapshot.restoreFailed) return
        const trimmed = question.trim()
        if (!trimmed || trimmed.length > 3000) return
        const next = makeCredentials(trimmed)
        await writeCredentials(next)
        credentials = next
        update({ hasSaved: true })
        await create()
        await advance()
      })
    },
    command(action, data = {}) {
      return run(async () => {
        if (!credentials || !snapshot.session) return
        pending = { action, data, version: snapshot.session.version }
        await mutate(action, data)
        pending = null
        await advance()
      })
    },
    pay() {
      return run(async () => {
        if (!purchase || !credentials || !snapshot.session) return
        await refresh()
        if (snapshot.session.payment_required) {
          try {
            await purchase((orderId, amount) => request(`/${credentials.id}/purchase`, { orderId, ...(amount ? { amount } : {}) }))
          } catch {
            update({ error: '결제를 완료하지 못했어요. 이미 결제했다면 같은 버튼으로 구매를 복구할 수 있어요.' })
            return
          }
        }
        await refresh()
        await mutate('draw')
        pending = null
        await advance()
      })
    },
    retry() {
      if (!credentials) return this.restore()
      return run(async () => {
        await refresh()
        if (pending && snapshot.session.version === pending.version) {
          await mutate(pending.action, pending.data)
        }
        pending = null
        await advance()
      })
    },
    reset() {
      return run(async () => {
        try { await storage.removeItem(SESSION_KEY) }
        catch { throw new EntryError('storageWrite') }
        credentials = null
        pending = null
        update({ session: null, hasSaved: false, restoreFailed: false, invalidSaved: false })
      })
    },
  }
}
