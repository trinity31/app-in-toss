import { initializeApp, getApps } from 'firebase/app'
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
  setDefaultEventParameters,
} from 'firebase/analytics'
import { getOperationalEnvironment } from '@apps-in-toss/web-framework'
import { isAnalyticsBackendAllowed } from './analytics-url'
import { nextUserType, readUserType, USER_TYPE_KEY } from './analytics-context'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const analyticsEnabled = isAnalyticsBackendAllowed(import.meta.env.VITE_API_BASE_URL)
let analytics = null
let storage
try { storage = window.localStorage } catch { /* optional */ }
let development = import.meta.env.DEV
try { development ||= getOperationalEnvironment() === 'sandbox' } catch { /* outside Toss */ }
let userType = readUserType(storage, development)

export function setAnalyticsUserType(value) {
  if (!analyticsEnabled) return
  userType = nextUserType(userType, value)
  try { storage?.setItem(USER_TYPE_KEY, userType) } catch { /* optional */ }
  try {
    setDefaultEventParameters({ app_platform: 'toss', user_type: userType })
    if (analytics) firebaseSetUserProperties(analytics, { app_platform: 'toss', user_type: userType })
  } catch { /* Analytics must not prevent a reading. */ }
}

export function getAnalyticsUserType() { return userType }
if (analyticsEnabled && typeof window !== 'undefined') {
  try {
    setDefaultEventParameters({ app_platform: 'toss', user_type: userType })
    analytics = getAnalytics(app)
    setAnalyticsUserType(userType)
  } catch (err) {
    console.error('[Firebase] Analytics 초기화 실패:', err)
  }
}

export function logEvent(eventName, eventParams = {}) {
  if (analyticsEnabled && analytics) {
    try {
      firebaseLogEvent(analytics, eventName, { ...eventParams, app_platform: 'toss', user_type: userType })
    } catch { /* Analytics must not block the app. */ }
  }
}

export function setUserId(userId) {
  if (!analyticsEnabled || !analytics) return
  try {
    firebaseSetUserId(analytics, userId)
  } catch (err) {
    console.warn('[Firebase] setUserId 실패:', err)
  }
}

export function setUserProperties(props) {
  if (!analyticsEnabled || !analytics) return
  try {
    firebaseSetUserProperties(analytics, props)
  } catch (err) {
    console.warn('[Firebase] setUserProperties 실패:', err)
  }
}

export { app, analytics }
