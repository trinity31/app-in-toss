import { EntryError } from './entryErrors.js'

export const validAccountId = value => typeof value === 'string' && /^(?:[A-Za-z0-9_-]{1,200}|toss:[A-Za-z0-9_-]{1,128})$/.test(value)
const validToken = value => typeof value === 'string' && value.length > 0 && value.length <= 4096 && !/\s/.test(value)

// The saved marker controls introduction presentation only. Credentials stay in memory.
export function createTossAccountHeaders({ baseUrl, createAnonymousKeyAuthCode, appLogin, fetcher = fetch, now = Date.now, readIntro = () => false, writeIntro = () => {}, timeoutMs = 15000 }) {
  let login = null
  let pending = null
  let restoring = null
  let recovering = null
  let generation = 0
  let automaticAttempted = false
  const listeners = new Set()
  const notify = () => listeners.forEach(listener => listener())
  const bounded = async work => {
    let timer
    try { return await Promise.race([Promise.resolve().then(work), new Promise((_, reject) => { timer = setTimeout(() => reject(new EntryError('login')), timeoutMs) })]) }
    finally { clearTimeout(timer) }
  }
  const current = started => { if (started !== generation) throw new EntryError('login') }
  const origin = target => {
    let base, destination
    try { base = new URL(baseUrl); destination = new URL(target || baseUrl) } catch { throw new EntryError('configuration') }
    if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password || destination.origin !== base.origin || destination.username || destination.password) throw new EntryError('configuration')
    return base.origin
  }
  const proof = async started => {
    let value
    try { value = await bounded(() => createAnonymousKeyAuthCode()) }
    catch { throw new EntryError('login') }
    current(started)
    if (typeof value?.code !== 'string' || !value.code.trim() || value.code.length > 2048 || !Number.isFinite(value.expiresIn) || value.expiresIn <= 0) throw new EntryError('login')
    return value.code
  }
  const post = async (path, body) => {
    let response
    try { response = await bounded(() => fetcher(`${origin()}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs), redirect: 'error', credentials: 'omit' })) }
    catch { throw new EntryError('exchangeNetwork') }
    if (!response.ok) throw new EntryError(response.status >= 500 ? 'exchangeServer' : 'exchangeRejected')
    try { return await bounded(() => response.json()) } catch { throw new EntryError('exchangeInvalid') }
  }
  const exchange = async started => {
    if (!headers.getSession()) {
      const data = await post('/toss-anonymous-session', { code: await proof(started) })
      current(started)
      if (!validAccountId(data?.userId) || !validToken(data?.token) || data.expiresIn !== 900) throw new EntryError('exchangeInvalid')
      login = { token: data.token, userId: data.userId, expiresAt: now() + 840000 }
      automaticAttempted = false
      try { await bounded(() => writeIntro(true)) } catch { /* Storage never grants or prevents authentication. */ }
      current(started)
      notify()
    }
    return { 'X-Toss-Anon-Token': login.token }
  }
  const headers = target => {
    try { origin(target) } catch (error) { return Promise.reject(error) }
    if (recovering) return recovering.then(() => headers(target))
    if (!pending) {
      const request = exchange(generation)
      pending = request
      request.finally(() => { if (pending === request) pending = null }).catch(() => {})
    }
    return pending
  }
  headers.getSession = () => login?.expiresAt > now() ? { ...login } : null
  headers.subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
  headers.clear = () => {
    generation++; login = null; pending = null; restoring = null
    automaticAttempted = true
    notify()
  }
  headers.restore = () => {
    if (headers.getSession()) return Promise.resolve(headers.getSession())
    if (restoring) return restoring
    if (automaticAttempted) return Promise.resolve(null)
    automaticAttempted = true
    const started = generation
    const request = (async () => {
      try {
        if (await bounded(readIntro) !== true) return null
        current(started)
        await headers()
        return started === generation ? headers.getSession() : null
      } catch { return null }
    })()
    restoring = request
    request.finally(() => { if (restoring === request) restoring = null }).catch(() => {})
    return request
  }
  // Explicit recovery is the only flow requesting OAuth consent. Never run at startup.
  headers.recoverLegacy = () => {
    if (recovering) return recovering
    generation++; pending = null; restoring = null; automaticAttempted = true
    const started = generation
    const request = (async () => {
      let oauth
      try { oauth = await bounded(() => appLogin()) } catch { throw new EntryError('login') }
      current(started)
      if (typeof oauth?.authorizationCode !== 'string' || !oauth.authorizationCode || typeof oauth.referrer !== 'string' || !oauth.referrer) throw new EntryError('login')
      const data = await post('/toss-login', { authorizationCode: oauth.authorizationCode, referrer: oauth.referrer, anonymousAuthCode: await proof(started) })
      current(started)
      if (data?.legacyLinked !== true) throw new EntryError('exchangeInvalid')
      login = null
      try { await exchange(started) } catch (error) { headers.clear(); throw error }
      return headers.getSession()
    })()
    recovering = request
    request.finally(() => { if (recovering === request) recovering = null }).catch(() => {})
    return request
  }
  return headers
}
