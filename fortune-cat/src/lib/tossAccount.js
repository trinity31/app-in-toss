import { EntryError } from './entryErrors.js'

// Cache only a validated exchange; failed attempts remain explicitly retryable.
export function createTossAccountHeaders({ baseUrl, appLogin, fetcher = fetch, now = Date.now, development = false }) {
  let login = null
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
  return async () => {
    if (!login || login.expiresAt <= now()) {
      if (!baseUrl) throw new EntryError('configuration')
      let result
      try { result = await appLogin() } catch (error) { throw loginError('SDK_REJECTED', error) }
      if (typeof result?.authorizationCode !== 'string' || !result.authorizationCode
        || typeof result.referrer !== 'string' || !result.referrer) throw loginError('SDK_INVALID_RESULT')
      let response
      try {
        response = await fetcher(`${baseUrl.replace(/\/$/, '')}/toss-login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorizationCode: result.authorizationCode, referrer: result.referrer }),
        })
      } catch { throw new EntryError('exchangeNetwork') }
      if (!response.ok) throw new EntryError(response.status >= 500 ? 'exchangeServer' : 'exchangeRejected')
      let data
      try { data = await response.json() } catch { throw new EntryError('exchangeInvalid') }
      if (typeof data?.accessToken !== 'string' || !data.accessToken
        || !Number.isFinite(data.expiresIn) || data.expiresIn <= 0) throw new EntryError('exchangeInvalid')
      login = { token: data.accessToken, expiresAt: now() + Math.max(0, data.expiresIn - 60) * 1000 }
    }
    return { 'X-Toss-Access-Token': login.token }
  }
}

// 로그인 창 없이 토스 로그인 연동 여부만 본다. 모르면(구버전 앱·오류·브리지 무응답)
// 로그인 안 된 것으로 보고 안내부터 보여준다.
export async function isTossLoggedIn(check, timeoutMs = 3000) {
  let timer
  const timeout = new Promise(resolve => { timer = setTimeout(() => resolve(false), timeoutMs) })
  try { return (await Promise.race([check(), timeout])) === true } catch { return false } finally { clearTimeout(timer) }
}
