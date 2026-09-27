import { SESSION_KEY } from './tarotConsultation.js'

export function tarotRuntime({ development, sandbox, baseUrl }) {
  if (!development || !sandbox) return { sandbox: false, baseUrl, sessionKey: SESSION_KEY }
  let url
  try { url = new URL(baseUrl) } catch {
    return { sandbox: true, baseUrl: null, sessionKey: `${SESSION_KEY}_SANDBOX` }
  }
  // Mock grants can only reach the separate local development service.
  if (!/^(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.test(url.hostname)) {
    return { sandbox: true, baseUrl: null, sessionKey: `${SESSION_KEY}_SANDBOX` }
  }
  url.port = '8001'
  url.pathname = '/sandbox'
  url.search = ''
  url.hash = ''
  return { sandbox: true, baseUrl: url.toString(), sessionKey: `${SESSION_KEY}_SANDBOX` }
}
