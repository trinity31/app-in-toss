import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Storage } from '@apps-in-toss/web-framework'
import { purchaseTarot } from '../lib/tarotPurchase'
import { createTarotConsultation } from '../lib/tarotConsultation'
import { useTarotTrack } from './useTarotTrack'
import { isSandbox } from '../lib/analytics'

const storage = {
  async getItem(key) {
    try {
      const value = await Storage.getItem(key)
      return value ?? (import.meta.env.DEV ? window.localStorage.getItem(key) : null)
    }
    catch (error) {
      if (import.meta.env.DEV) return window.localStorage.getItem(key)
      throw error
    }
  },
  async setItem(key, value) {
    try {
      await Storage.setItem(key, value)
      if (await Storage.getItem(key) !== value) throw new Error('Storage verification failed')
    } catch (error) {
      if (!import.meta.env.DEV) throw error
      window.localStorage.setItem(key, value)
    }
  },
  async removeItem(key) {
    try { await Storage.removeItem(key) }
    catch (error) { if (!import.meta.env.DEV) throw error }
    if (import.meta.env.DEV) window.localStorage.removeItem(key)
  },
}

export function useTarotConsultation() {
  const track = useTarotTrack()
  const trackRef = useRef(track)
  trackRef.current = track
  const [client] = useState(() => {
    let login = null
    // 결제 퍼널(시도 → 완료/실패). revenue 는 콘솔 등록가라 매출 확정값은 payment_histories 를 기준으로 본다.
    const purchase = async grant => {
      trackRef.current('tarot_purchase_started')
      let paid = {}
      try {
        await purchaseTarot(async (orderId, amount) => {
          // 샌드박스 테스트 결제는 금액을 보내지 않아 payment_histories(운영 매출)에 기록되지 않는다.
          await grant(orderId, isSandbox() ? undefined : amount)
          paid = { order_id: orderId, revenue: amount }
        })
        trackRef.current('tarot_purchase_completed', paid)
      } catch (error) {
        trackRef.current('tarot_purchase_failed', { reason: error?.message || 'cancelled' })
        throw error
      }
    }
    return createTarotConsultation({ baseUrl: import.meta.env.VITE_API_BASE_URL, storage, purchase,
      accountHeaders: async () => {
        if (!login || login.expiresAt <= Date.now()) {
          const { appLogin } = await import('@apps-in-toss/web-framework')
          const result = await appLogin()
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/toss-login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ authorizationCode: result.authorizationCode, referrer: result.referrer }),
          })
          if (!response.ok) throw new Error('무료 상담을 이용하려면 토스에 로그인해 주세요.')
          const data = await response.json()
          login = { token: data.accessToken, expiresAt: Date.now() + Math.max(0, data.expiresIn - 60) * 1000 }
        }
        return { 'X-Toss-Access-Token': login.token }
      },
    })
  })
  const state = useSyncExternalStore(client.subscribe, client.getSnapshot)
  useEffect(() => { client.restore() }, [client])
  return { ...state, client, track }
}
