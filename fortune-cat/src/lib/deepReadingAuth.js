import { validAccountId } from './tossAccount.js'
export { validAccountId } from './tossAccount.js'
const allowedPath = path => /^\/(?:deep-reading(?:-match)?\/(?:start|chat|conversation|history(?:\/[^/]+)?|free-reveal|reveal)|payment\/deep-reading\/toss-grant|quota|track|analytics\/context)$/.test(path)

// Reading requests use an explicitly established, memory-only account session.
export function createDeepReadingRequest({ baseUrl, session, fetcher = fetch, onUnauthorized = () => {} }) {
  return async (path, options = {}) => {
    const base = new URL(baseUrl)
    const url = new URL(path, `${base.origin}/`)
    if (url.username || url.password || url.origin !== base.origin || !allowedPath(url.pathname)) throw new Error('요청 주소를 확인하지 못했어요.')
    const account = session()
    if (!validAccountId(account?.userId) || !account?.token) throw new Error('사용자 확인이 필요해요. 다시 시작해 주세요.')
    const headers = new Headers(options.headers)
    stripCompetingHeaders(headers)
    headers.set('X-Toss-Anon-Token', account.token)
    let body = options.body
    const method = (options.method || 'GET').toUpperCase()
    if (method === 'GET' || method === 'DELETE') {
      url.searchParams.set('user_anonymous_id', account.userId)
      if (body != null) throw new Error('요청 형식을 확인하지 못했어요.')
    } else if (body instanceof FormData) {
      body = new FormData()
      for (const [key, value] of options.body) body.append(key, value)
      body.set('user_anonymous_id', account.userId)
      headers.delete('Content-Type')
    } else {
      body = JSON.stringify({ ...(body ? JSON.parse(body) : {}), user_anonymous_id: account.userId })
      headers.set('Content-Type', 'application/json')
    }
    if (method !== 'GET' && method !== 'DELETE') url.searchParams.delete('user_anonymous_id')
    const response = await fetcher(url.toString(), { ...options, headers, body, redirect: 'error', credentials: 'omit' })
    // A late response from an old token must not invalidate a newer login.
    if (response.status === 401 && session()?.token === account.token) onUnauthorized()
    return response
  }
}

export function stripCompetingHeaders(headers) {
  for (const name of ['X-API-Key', 'X-Toss-Access-Token', 'Authorization', 'X-Tarot-User', 'X-User-Id']) headers.delete(name)
}

// Tarot capabilities may accompany account proof, but never travel to a different origin.
export function createTossResourceFetch({ baseUrl, session, fetcher = fetch, onUnauthorized = () => {} }) {
  return async (target, options = {}) => {
    const base = new URL(baseUrl)
    const url = new URL(target, base)
    if (url.origin !== base.origin || url.username || url.password || !/^\/tarot\/sessions(?:\/|$)/.test(url.pathname)) throw new Error('요청 주소를 확인하지 못했어요.')
    const account = session()
    if (!validAccountId(account?.userId) || !account?.token) throw new Error('사용자 확인이 필요해요. 다시 시작해 주세요.')
    const headers = new Headers(options.headers)
    stripCompetingHeaders(headers)
    headers.set('X-Toss-Anon-Token', account.token)
    const response = await fetcher(url.toString(), { ...options, headers, redirect: 'error', credentials: 'omit' })
    if (response.status === 401 && session()?.token === account.token) onUnauthorized()
    return response
  }
}
