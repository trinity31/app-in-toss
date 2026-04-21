import { createContext, useContext, useEffect, useState } from 'react'
import { getAnonymousKey, Storage } from '@apps-in-toss/web-framework'
import { setUserId, setUserProperties } from '../lib/firebase'

const ANONYMOUS_KEY_STORAGE_KEY = 'FORTUNE_CAT_ANONYMOUS_KEY'

const AnonymousKeyContext = createContext({ anonymousKey: null, loading: true })

export function AnonymousKeyProvider({ children }) {
  const [anonymousKey, setAnonymousKey] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const applyToAnalytics = (hash) => {
      setUserId(hash)
      setUserProperties({ anonymous_key: hash })
    }

    async function resolveKey() {
      try {
        const cached = await Storage.getItem(ANONYMOUS_KEY_STORAGE_KEY)
        if (typeof cached === 'string' && cached && cached !== '[object Object]') {
          if (!cancelled) {
            setAnonymousKey(cached)
            applyToAnalytics(cached)
          }
          return
        }
        if (cached) {
          await Storage.removeItem(ANONYMOUS_KEY_STORAGE_KEY)
        }

        if (typeof getAnonymousKey !== 'function') {
          console.warn('[AnonymousKey] SDK 미지원: getAnonymousKey 함수가 없습니다.')
          return
        }

        const result = await getAnonymousKey()
        if (!result) {
          console.warn('[AnonymousKey] 구 SDK/토스앱 환경으로 undefined 반환')
          return
        }
        if (result === 'ERROR') {
          console.warn('[AnonymousKey] SDK 가 ERROR 반환')
          return
        }
        if (result.type !== 'HASH' || typeof result.hash !== 'string') {
          console.warn('[AnonymousKey] 예상치 못한 응답 형태:', result)
          return
        }

        const hash = result.hash
        console.log('[AnonymousKey] 발급:', hash)
        if (!cancelled) {
          setAnonymousKey(hash)
          applyToAnalytics(hash)
        }
        try {
          await Storage.setItem(ANONYMOUS_KEY_STORAGE_KEY, hash)
        } catch (e) {
          console.warn('[AnonymousKey] Storage 저장 실패:', e)
        }
      } catch (err) {
        console.warn('[AnonymousKey] 발급 실패:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    resolveKey()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AnonymousKeyContext.Provider value={{ anonymousKey, loading }}>
      {children}
    </AnonymousKeyContext.Provider>
  )
}

export function useAnonymousKey() {
  return useContext(AnonymousKeyContext)
}
