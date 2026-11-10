import { createTossAccountHeaders } from './src/lib/tossAccount.js'
import { createDeepReadingRequest, createTossResourceFetch } from './src/lib/deepReadingAuth.js'
export const backend = 'http://127.0.0.1:8019'
export const customer = new URLSearchParams(location.search).get('customer') || 'legacy'
const scenario = new URLSearchParams(location.search).get('scenario') || 'normal'
const marker = `preview-intro-${customer}`
window.__stats = { proof: 0, oauth: 0, exchange: 0 }
let clockOffset = 0
const localFetch = (url, options) => {
  if (new URL(url).origin !== backend) throw Error('Loopback fixture only')
  return fetch(url, options)
}
export const helper = async (path, body) => {
  const response = await localFetch(`${backend}/__preview/${path}`, { ...(body !== undefined ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)} : {}) })
  if (!response.ok) throw Error(`MOCK helper ${response.status}`)
  return response.json()
}
const account = createTossAccountHeaders({
  baseUrl: backend, now: () => Date.now() + clockOffset,
  readIntro: () => localStorage.getItem(marker) === '1',
  writeIntro: () => localStorage.setItem(marker, '1'),
  createAnonymousKeyAuthCode: async () => {
    window.__stats.proof++
    if (scenario === 'native-timeout') return new Promise(() => {})
    if (scenario === 'unsupported') throw Error('MOCK unsupported bridge')
    if (scenario === 'pending') await new Promise(resolve => {window.__releaseProof = resolve})
    return helper('code',{customer,scenario:['proof-failure','provider-unavailable'].includes(scenario)?scenario:'normal'})
  },
  appLogin: async () => {window.__stats.oauth++;return {authorizationCode:'preview-oauth-orphan',referrer:'DEFAULT'}},
  fetcher: async (url,options) => {
    if (url.endsWith('/toss-anonymous-session')) window.__stats.exchange++
    const response = await localFetch(url,options)
    if (scenario === 'expired-session' && response.ok && url.endsWith('/toss-anonymous-session')) return {ok:true,json:()=>helper('expired-token',{customer})}
    return response
  },
})
export const getTossSession = account.getSession
export const subscribeTossAccount = account.subscribe
export const restoreTossAccount = account.restore
export const loginTossAccount = () => account()
export const recoverLegacyTossAccount = () => account.recoverLegacy()
export const getTossAccountHeaders = target => account(target)
export const authenticatedReadingFetch = createDeepReadingRequest({baseUrl:backend,session:getTossSession,fetcher:localFetch,onUnauthorized:account.clear})
export const authenticatedTarotFetch = createTossResourceFetch({baseUrl:backend,session:getTossSession,fetcher:localFetch,onUnauthorized:account.clear})
window.__preview = {
  clear:account.clear,
  expire:async()=>{clockOffset+=841000;return account.restore()},
  first:()=>{localStorage.removeItem(marker);location.reload()},
  session:account.getSession,
}
