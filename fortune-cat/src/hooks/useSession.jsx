import { createContext, useCallback, useContext, useState } from 'react'

/**
 * 딥리딩(`/deep-reading/start`, `/deep-reading-match/start`) 호출 시점을 기준으로
 * 한 "리딩 세션" 을 식별하는 UUID 를 관리한다.
 * - 리딩 시작 시 `startNewSession()` 을 호출하면 새 UUID 발급
 * - 이후 후속질문(`/chat`) 요청은 같은 session_id 를 유지
 * - sessionStorage 에 캐시되어 새로고침 시에도 유지 (탭/웹뷰 종료 시 소멸)
 */

const SESSION_ID_KEY = 'FORTUNE_CAT_DEEP_READING_SESSION_ID'

const SessionContext = createContext({ sessionId: null, startNewSession: () => null })

function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readStoredSession() {
  try {
    const id = sessionStorage.getItem(SESSION_ID_KEY)
    return id || null
  } catch {
    return null
  }
}

function writeSession(id) {
  try {
    sessionStorage.setItem(SESSION_ID_KEY, id)
  } catch {
    /* sessionStorage 사용 불가 환경 무시 */
  }
}

export function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(() => readStoredSession())

  const startNewSession = useCallback(() => {
    const fresh = generateSessionId()
    writeSession(fresh)
    setSessionId(fresh)
    console.log('[Session] 새 리딩 세션 시작:', fresh)
    return fresh
  }, [])

  return (
    <SessionContext.Provider value={{ sessionId, startNewSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
