import { EntryError } from './entryErrors.js'

// Cache only a validated exchange; failed attempts remain explicitly retryable.
export function createTossAccountHeaders({ baseUrl, appLogin, createAnonymousKeyAuthCode, fetcher = fetch, now = Date.now, development = false, checkIntegrated, integrationTimeoutMs = 3000 }) {
  let login = null
  let pending = null
  let restoring = null
  let generation = 0
  let automaticAttempted = false
  const listeners = new Set()
  const loginError = (reason, error) => {
    const failure = new EntryError('login')
    // Never expose native messages, payloads, or authorization codes.
    if (development) {
      const code = error?.code
      const safeCode = Number.isSafeInteger(code) || (typeof code === 'string' && /^[A-Z][A-Z0-9_]{0,47}$/.test(code))
        ? `; code=${code}` : ''
      const name = ['Error', 'TypeError', 'ReferenceError', 'NetworkError'].includes(error?.name) ? `; ${error.name}` : ''
      failure.message += ` [${reason}${name}${safeCode}]`
    }
    return failure
  }
  const bounded = async work => {
    let timer
    try {
      return await Promise.race([work(), new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('login_timeout')), 15000) })])
    } finally { clearTimeout(timer) }
  }
  const exchange = async (startedAt) => {
    if (!login || login.expiresAt <= now()) {
      if (!baseUrl) throw new EntryError('configuration')
      let result
      try { result = await bounded(appLogin) } catch (error) { throw loginError('SDK_REJECTED', error) }
      if (typeof result?.authorizationCode !== 'string' || !result.authorizationCode
        || typeof result.referrer !== 'string' || !result.referrer) throw loginError('SDK_INVALID_RESULT')
      if (startedAt !== generation) throw new EntryError('login')
      // Obtain fresh, single-use native proof after consent so it cannot expire in the login UI.
      let proof
      try { proof = await bounded(() => createAnonymousKeyAuthCode()) } catch (error) { throw loginError('PROOF_REJECTED', error) }
      if (typeof proof?.code !== 'string' || !proof.code.trim() || proof.code.length > 2048
        || !Number.isFinite(proof.expiresIn) || proof.expiresIn <= 0) throw loginError('PROOF_INVALID_RESULT')
      if (startedAt !== generation) throw new EntryError('login')
      let response
      try {
        response = await bounded(() => fetcher(`${baseUrl.replace(/\/$/, '')}/toss-login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorizationCode: result.authorizationCode, referrer: result.referrer, anonymousAuthCode: proof.code }),
          signal: AbortSignal.timeout(15000),
        }))
      } catch { throw new EntryError('exchangeNetwork') }
      if (!response.ok) throw new EntryError(response.status >= 500 ? 'exchangeServer' : 'exchangeRejected')
      let data
      try { data = await bounded(() => response.json()) } catch { throw new EntryError('exchangeInvalid') }
      if (data?.legacyLinked !== true || typeof data?.accessToken !== 'string' || !data.accessToken
        || !Number.isFinite(data.expiresIn) || data.expiresIn <= 0) throw new EntryError('exchangeInvalid')
      const key = data.userKey
      const userId = (typeof key === 'string' || Number.isSafeInteger(key)) && /^(?:0|[1-9][0-9]{0,39})$/.test(String(key)) ? `toss:${key}` : null
      if (!userId || data.expiresIn <= 60) throw new EntryError('exchangeInvalid')
      // Clearing a session also invalidates every earlier SDK/exchange result.
      if (startedAt !== generation) throw new EntryError('login')
      login = { token: data.accessToken, userId, expiresAt: now() + (Math.min(data.expiresIn, 3600) - 60) * 1000 }
      automaticAttempted = false
      listeners.forEach(listener => listener())
    }
    return { 'X-Toss-Access-Token': login.token }
  }
  const headers = () => {
    if (!pending) {
      const request = exchange(generation)
      pending = request
      request.finally(() => { if (pending === request) pending = null }).catch(() => {})
    }
    return pending
  }
  headers.getSession = () => login && login.userId && login.expiresAt > now() ? { ...login } : null
  headers.subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
  headers.clear = () => {
    generation++
    login = null
    pending = null
    restoring = null
    // HTTP 401 must return to an explicit retry, never an automatic loop.
    automaticAttempted = true
    listeners.forEach(listener => listener())
  }
  headers.restore = () => {
    const session = headers.getSession()
    if (session) return Promise.resolve(session)
    if (restoring) return restoring
    if (automaticAttempted) return Promise.resolve(null)
    automaticAttempted = true
    const startedAt = generation
    const request = (async () => {
      try {
        // Native integration only allows a fresh server-verified login attempt.
        if (!await isTossLoggedIn(checkIntegrated, integrationTimeoutMs) || startedAt !== generation) return null
        await headers()
        return startedAt === generation ? headers.getSession() : null
      } catch { return null }
    })()
    restoring = request
    request.finally(() => { if (restoring === request) restoring = null }).catch(() => {})
    return request
  }
  return headers
}

// 로그인 창 없이 토스 로그인 연동 여부만 본다. 모르면(구버전 앱·오류·브리지 무응답)
// 로그인 안 된 것으로 보고 안내부터 보여준다.
export async function isTossLoggedIn(check, timeoutMs = 3000) {
  let timer
  const timeout = new Promise(resolve => { timer = setTimeout(() => resolve(false), timeoutMs) })
  try { return (await Promise.race([check(), timeout])) === true } catch { return false } finally { clearTimeout(timer) }
}
