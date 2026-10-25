const allowedPath = path => /^\/(?:deep-reading(?:-match)?\/(?:start|chat|conversation|history(?:\/[^/]+)?|free-reveal|reveal)|payment\/deep-reading\/toss-grant|quota|track|analytics\/context)$/.test(path)
export const validAccountId = value => typeof value === 'string' && /^toss:(?:0|[1-9][0-9]{0,39})$/.test(value)

// Reading requests use an explicitly established, memory-only account session.
export function createDeepReadingRequest({ baseUrl, session, fetcher = fetch, onUnauthorized = () => {} }) {
  return async (path, options = {}) => {
    const base = new URL(baseUrl)
    const url = new URL(path, `${base.origin}/`)
    if (url.origin !== base.origin || !allowedPath(url.pathname)) throw new Error('요청 주소를 확인하지 못했어요.')
    const account = session()
    if (!validAccountId(account?.userId) || !account?.token) throw new Error('토스 로그인이 필요해요. 다시 로그인해 주세요.')
    const headers = new Headers(options.headers)
    headers.delete('X-API-Key')
    headers.set('X-Toss-Access-Token', account.token)
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
    const response = await fetcher(url.toString(), { ...options, headers, body, redirect: 'error' })
    // A late response from an old token must not invalidate a newer login.
    if (response.status === 401 && session()?.token === account.token) onUnauthorized()
    return response
  }
}
