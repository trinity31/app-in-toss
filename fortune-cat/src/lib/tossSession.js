import { createTossAccountHeaders } from './tossAccount.js'
import { createDeepReadingRequest } from './deepReadingAuth.js'
const account = createTossAccountHeaders({
  baseUrl: import.meta.env?.VITE_API_BASE_URL,
  appLogin: async () => (await import('@apps-in-toss/web-framework')).appLogin(),
})
export const getTossSession = () => account.getSession()
export const subscribeTossAccount = listener => account.subscribe(listener)
export async function loginTossAccount() {
  await account()
  if (!getTossSession()) { account.clear(); throw new Error('계정 정보를 확인하지 못했어요. 다시 로그인해 주세요.') }
  return getTossSession()
}
export const authenticatedReadingFetch = createDeepReadingRequest({ baseUrl: import.meta.env?.VITE_API_BASE_URL, session: getTossSession, onUnauthorized: account.clear })
