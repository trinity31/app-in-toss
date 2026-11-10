import { createHmac, randomUUID } from 'node:crypto'

const routes = /^\/(?:deep-reading(?:-match)?\/(?:start|chat|conversation|history(?:\/[^/]+)?|free-reveal|reveal)|quota|track|analytics\/context)$/
const mockCode = /^mock-anon-code-[0-9a-f-]{36}$/
const tarotRoutes = /^\/tarot\/sessions(?:\/free|\/history(?:\/[0-9a-f-]{36})?|\/[0-9a-f-]{36}(?:\/(?:plan|answer|revise|draw|interpret|clarify|interpret-clarifier))?)?$/

function sessionToken(key, uid) {
  const now = Math.floor(Date.now() / 1000)
  const claims = { v: 1, iss: 'catbot-toss-anonymous', aud: 'catbot-backend', sub: uid, anon: uid, iat: now, exp: now + 900 }
  const payload = Buffer.from(JSON.stringify(claims, Object.keys(claims).sort())).toString('base64url')
  return `${payload}.${createHmac('sha256', key).update(payload).digest('base64url')}`
}

// Only the standalone loopback launcher imports this bridge. The BFF key stays server-side.
export function realAiProxy({ origin, upstream, key, uid = `local_ai_${randomUUID().replaceAll('-', '')}`, fetcher = fetch }) {
  const sessions = new Map(), usedCodes = new Set()
  const reply = (res, status, data) => {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
    res.end(JSON.stringify(data))
  }
  return async (req, res, next) => {
    if (req.headers.host !== new URL(origin).host || (req.headers.origin && req.headers.origin !== origin)) return reply(res, 403, { detail: 'Local browser only' })
    const url = new URL(req.url, origin)
    const sessionRoute = url.pathname === '/toss-anonymous-session'
    const tarotRoute = tarotRoutes.test(url.pathname)
    if (!sessionRoute && !tarotRoute && !routes.test(url.pathname)) {
      if (/^\/(payment|toss-login|tarot\/sessions)(\/|$)/.test(url.pathname)) return reply(res, 403, { detail: 'Real payments and Toss login are unavailable in local AI mode' })
      return next()
    }
    if (!['GET', 'POST', 'DELETE'].includes(req.method)) return reply(res, 405, { detail: 'Method not allowed' })
    try {
      let body
      if (req.method === 'POST') {
        const chunks = []; let size = 0
        for await (const chunk of req) {
          size += chunk.length
          if (size > 32768) return reply(res, 413, { detail: 'Request too large' })
          chunks.push(chunk)
        }
        body = Buffer.concat(chunks)
      }
      if (sessionRoute) {
        if (req.method !== 'POST' || req.headers.origin !== origin) return reply(res, 403, { detail: 'Local browser only' })
        const { code } = JSON.parse(body.toString())
        if (!mockCode.test(code) || usedCodes.has(code)) return reply(res, 401, { detail: 'Fresh local proof required' })
        // Bound local proof/session memory for long-running development sessions.
        if (usedCodes.size >= 1000) return reply(res, 429, { detail: 'Restart the local launcher' })
        usedCodes.add(code)
        for (const [token, expires] of sessions) if (expires <= Date.now()) sessions.delete(token)
        const token = sessionToken(key, uid)
        sessions.set(token, Date.now() + 900000)
        return reply(res, 200, { token, userId: uid, expiresIn: 900 })
      }
      if ((sessions.get(req.headers['x-toss-anon-token']) || 0) <= Date.now()) return reply(res, 401, { detail: 'Local session required' })
      const target = new URL(url.pathname + url.search, upstream)
      const headers = tarotRoute ? { 'X-Toss-Anon-Token': req.headers['x-toss-anon-token'] } : { 'X-API-Key': key }
      if (tarotRoute) {
        if (/^[a-f0-9]{64}$/.test(req.headers['x-tarot-token'] || '')) headers['X-Tarot-Token'] = req.headers['x-tarot-token']
        if (req.headers['x-tarot-deck'] === 'tarot78-v1') headers['X-Tarot-Deck'] = 'tarot78-v1'
      }
      if (req.method === 'POST') {
        const contentType = req.headers['content-type'] || ''
        if (contentType.startsWith('multipart/form-data')) {
          body = await new Request(origin, { method: 'POST', headers: { 'Content-Type': contentType }, body }).formData()
          body.set('user_anonymous_id', uid)
        } else if (contentType.startsWith('application/json')) {
          const data = JSON.parse(body.toString())
          if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(res, 422, { detail: 'Object required' })
          if (tarotRoute) {
            delete data.user_anonymous_id
            body = JSON.stringify(data)
          } else body = JSON.stringify({ ...data, user_anonymous_id: uid })
          headers['Content-Type'] = 'application/json'
        } else return reply(res, 415, { detail: 'Unsupported request body' })
        target.searchParams.delete('user_anonymous_id')
      } else if (!tarotRoute) target.searchParams.set('user_anonymous_id', uid)
      const response = await fetcher(target, { method: req.method, headers, body, redirect: 'error', signal: AbortSignal.timeout(185000) })
      res.writeHead(response.status, { 'Content-Type': response.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' })
      res.end(Buffer.from(await response.arrayBuffer()))
    } catch {
      reply(res, 502, { detail: 'Local AI backend request failed. Check the launcher log.' })
    }
  }
}
