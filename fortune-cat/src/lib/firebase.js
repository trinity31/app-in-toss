import { initializeApp, getApps } from 'firebase/app'
import {
  getAnalytics,
  logEvent as firebaseLogEvent,
  setUserId as firebaseSetUserId,
  setUserProperties as firebaseSetUserProperties,
} from 'firebase/analytics'

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

let analytics = null
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app)
  } catch (err) {
    console.error('[Firebase] Analytics 초기화 실패:', err)
  }
}

export function logEvent(eventName, eventParams = {}) {
  if (analytics) {
    firebaseLogEvent(analytics, eventName, eventParams)
    console.log(`[Firebase] Event logged: ${eventName}`, eventParams)
  }
}

export function setUserId(userId) {
  if (!analytics) return
  try {
    firebaseSetUserId(analytics, userId)
  } catch (err) {
    console.warn('[Firebase] setUserId 실패:', err)
  }
}

export function setUserProperties(props) {
  if (!analytics) return
  try {
    firebaseSetUserProperties(analytics, props)
  } catch (err) {
    console.warn('[Firebase] setUserProperties 실패:', err)
  }
}

export { app, analytics }
