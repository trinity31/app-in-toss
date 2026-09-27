import { EntryError } from './entryErrors.js'

// Cache only a validated exchange; failed attempts remain explicitly retryable.
export function createTossAccountHeaders({ baseUrl, appLogin, fetcher = fetch, now = Date.now }) {
  let login = null
  return async () => {
    if (!login || login.expiresAt <= now()) {
      if (!baseUrl) throw new EntryError('configuration')
      let result
      try { result = await appLogin() } catch { throw new EntryError('login') }
      if (typeof result?.authorizationCode !== 'string' || !result.authorizationCode
        || typeof result.referrer !== 'string' || !result.referrer) throw new EntryError('login')
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
