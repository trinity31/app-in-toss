export const SESSION_KEY = 'FORTUNE_CAT_TAROT_CONSULTATION'

function newCredentials(question) {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return {
    id: crypto.randomUUID(),
    token: Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(''),
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
export function createTarotConsultation({ baseUrl, storage, fetcher = fetch, makeCredentials = newCredentials }) {
  let credentials = null
  let active = null
  let pending = null
  let snapshot = { session: null, busy: false, error: null, initialized: false, hasSaved: false }
  const listeners = new Set()
  const update = values => {
    snapshot = { ...snapshot, ...values }
    listeners.forEach(listener => listener())
  }

  async function request(path, body) {
    if (!baseUrl) throw new Error('상담 연결 주소를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.')
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 110000)
    try {
      const response = await fetcher(`${baseUrl.replace(/\/$/, '')}/tarot/sessions${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', 'X-Tarot-Token': credentials.token },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
      })
      if (!response.ok) {
        const error = new Error(response.status === 404
          ? '저장된 상담을 찾지 못했어요. 잠시 후 다시 불러와 주세요.'
          : '상담을 연결하지 못했어요. 저장된 내용을 다시 불러와 이어갈 수 있어요.')
        error.status = response.status
        throw error
      }
      const session = await response.json()
      if (session.id !== credentials.id || !Number.isInteger(session.version) || !Array.isArray(session.cards)) {
        throw new Error('상담 내용을 확인하지 못했어요. 다시 불러와 주세요.')
      }
      update({ session, error: null })
      return session
    } finally {
      clearTimeout(timer)
    }
  }

  async function create() {
    const session = await request('', { id: credentials.id, question: credentials.question })
    credentials = { ...credentials, created: true }
    await storage.setItem(SESSION_KEY, JSON.stringify(credentials))
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
      update({ error: error.status === 404 ? error.message : '연결이 원활하지 않아요. 입력과 뽑은 카드는 유지되니 다시 시도해 주세요.' })
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
        const raw = await storage.getItem(SESSION_KEY)
        if (!raw) return
        update({ hasSaved: true })
        const parsed = JSON.parse(raw)
        if (!validCredentials(parsed)) throw new Error('Invalid saved consultation')
        credentials = parsed
        await refresh()
      })
    },
    start(question) {
      return run(async () => {
        if (credentials || snapshot.hasSaved) return
        const trimmed = question.trim()
        if (!trimmed || trimmed.length > 3000) return
        const next = makeCredentials(trimmed)
        await storage.setItem(SESSION_KEY, JSON.stringify(next))
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
        await storage.removeItem(SESSION_KEY)
        credentials = null
        pending = null
        update({ session: null, hasSaved: false })
      })
    },
  }
}
