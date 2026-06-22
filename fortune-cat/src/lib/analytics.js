// 클릭 이벤트 통합 추적 — Firebase Analytics + 토스 콘솔 Analytics 양쪽 발화.
// Firebase 는 풍부한 파라미터로 funnel/리텐션 분석, 토스 콘솔은 button_name 단위 클릭 카운트용.
//
// 사용 예:
//   trackClick('quick_menu_click', { menu: '사주분석' }, '사주분석')
//   trackClick('share_click')  // button_name = 'share_click' 로 자동 fallback

import { Analytics } from '@apps-in-toss/web-framework'
import { logEvent } from './firebase'

/**
 * @param {string} eventName - Firebase 이벤트명 (snake_case, GA4 규약)
 * @param {object} [params] - Firebase 파라미터
 * @param {string} [buttonName] - 토스 콘솔 노출용 button_name (생략 시 eventName 사용)
 */
export function trackClick(eventName, params = {}, buttonName) {
  logEvent(eventName, params)
  try {
    Analytics.click({ button_name: buttonName || eventName })
  } catch (err) {
    console.warn('[Toss Analytics] click 실패:', err)
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const API_KEY = import.meta.env.VITE_SAJU_AI_API_KEY

/**
 * 서버(Supabase user_events)로 이벤트 기록 — 결제 funnel SQL 분석용. fire-and-forget.
 * @param {string} eventName
 * @param {object} [eventParams]
 * @param {string} [anonymousKey]
 * @param {string} [sessionId]
 */
export function trackServerEvent(eventName, eventParams = {}, anonymousKey, sessionId) {
  try {
    fetch(`${API_BASE_URL}/track`, {
      method: 'POST',
      headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        event_params: eventParams,
        user_anonymous_id: anonymousKey,
        session_id: sessionId,
      }),
      keepalive: true,
    }).catch(() => {})
  } catch {
    /* ignore */
  }
}
