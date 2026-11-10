import { createTossAccountHeaders } from './tossAccount.js'
import { createDeepReadingRequest, createTossResourceFetch } from './deepReadingAuth.js'
const baseUrl = import.meta.env?.VITE_API_BASE_URL
const marker = 'fortune-cat-intro-completed-v1'
const account = createTossAccountHeaders({
  baseUrl,
  appLogin: async () => (await import('@apps-in-toss/web-framework')).appLogin(),
  createAnonymousKeyAuthCode: async () => (await import('@apps-in-toss/web-framework')).User.createAnonymousKeyAuthCode(),
  readIntro: () => { try { return localStorage.getItem(marker) === '1' } catch { return false } },
  writeIntro: () => { try { localStorage.setItem(marker, '1') } catch { /* Presentation only. */ } },
})
export const getTossSession = () => account.getSession()
export const restoreTossAccount = () => account.restore()
export const subscribeTossAccount = listener => account.subscribe(listener)
export async function loginTossAccount() { await account(); return getTossSession() }
export const recoverLegacyTossAccount = () => account.recoverLegacy()
export const getTossAccountHeaders = target => account(target)
export const authenticatedReadingFetch = createDeepReadingRequest({ baseUrl, session: getTossSession, onUnauthorized: account.clear })
export const authenticatedTarotFetch = createTossResourceFetch({ baseUrl, session: getTossSession, onUnauthorized: account.clear })
