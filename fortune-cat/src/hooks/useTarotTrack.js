import { useCallback, useRef } from 'react'
import { logEvent } from '../lib/firebase'
import { isSandbox, trackServerEvent } from '../lib/analytics'
import { useAnonymousKey } from './useAnonymousKey.jsx'
import { useSession } from './useSession.jsx'

/**
 * 타로 성과 측정 이벤트 — Firebase + 서버(user_events) 양쪽으로 보낸다.
 * product: 'tarot' 를 항상 붙여 사주 결제 이벤트와 섞이지 않게 한다.
 * 샌드박스는 Firebase 에만 남기고 서버(운영 퍼널 집계)에는 보내지 않는다.
 */
export function useTarotTrack() {
  const { anonymousKey } = useAnonymousKey()
  const { sessionId } = useSession()
  const ids = useRef({})
  ids.current = { anonymousKey, sessionId }
  return useCallback((name, params = {}) => {
    const eventParams = { product: 'tarot', ...params }
    logEvent(name, { ...eventParams, session_id: ids.current.sessionId })
    if (!isSandbox()) trackServerEvent(name, eventParams, ids.current.anonymousKey, ids.current.sessionId)
  }, [])
}
