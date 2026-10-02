import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Storage } from '@apps-in-toss/web-framework'
import { purchaseTarot } from '../lib/tarotPurchase'
import { createTarotConsultation } from '../lib/tarotConsultation'
import { useTarotTrack } from './useTarotTrack'
import { createTossAccountHeaders } from '../lib/tossAccount'
import { isSandbox } from '../lib/analytics'
import { tarotRuntime } from '../lib/tarotRuntime'

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
  const [paymentDiagnostics, setPaymentDiagnostics] = useState([])
  const [runtime] = useState(() => tarotRuntime({
    development: import.meta.env.DEV, sandbox: isSandbox(), baseUrl: import.meta.env.VITE_API_BASE_URL,
  }))
  const track = useTarotTrack(runtime.sandbox)
  const trackRef = useRef(track)
  trackRef.current = track
  const [client] = useState(() => {
    // 결제 퍼널(시도 → 완료/실패). revenue 는 콘솔 등록가라 매출 확정값은 payment_histories 를 기준으로 본다.
    const purchase = async grant => {
      trackRef.current('tarot_purchase_started')
      let paid = {}
      try {
        await purchaseTarot(async (orderId, amount) => {
          // 샌드박스 테스트 결제는 금액을 보내지 않아 payment_histories(운영 매출)에 기록되지 않는다.
          await grant(orderId, isSandbox() ? undefined : amount)
          paid = { order_id: orderId, revenue: amount }
        }, undefined, diagnostic => {
          if (diagnostic.stage === 'started') setPaymentDiagnostics([])
          if (diagnostic.error_code && diagnostic.stage !== 'purchase_failed') {
            setPaymentDiagnostics(previous => [...previous, diagnostic].slice(-3))
          } else if (diagnostic.stage === 'purchase_failed') {
            setPaymentDiagnostics(previous => previous.length ? previous : [diagnostic])
          }
          trackRef.current('tarot_payment_diagnostic', diagnostic)
        }, { receiptKey: runtime.sandbox ? 'tarot_pending_purchase_sandbox_v1' : 'tarot_pending_purchase_v1' })
        trackRef.current('tarot_purchase_completed', paid)
      } catch (error) {
        trackRef.current('tarot_purchase_failed', { reason: 'payment_failed' })
        throw error
      }
    }
    return createTarotConsultation({ baseUrl: runtime.baseUrl, sessionKey: runtime.sessionKey, storage, purchase,
      accountHeaders: createTossAccountHeaders({
        baseUrl: import.meta.env.VITE_API_BASE_URL,
        development: import.meta.env.DEV,
        appLogin: async () => {
          const { appLogin } = await import('@apps-in-toss/web-framework')
          return appLogin()
        },
      }),
    })
  })
  const state = useSyncExternalStore(client.subscribe, client.getSnapshot)
  useEffect(() => { client.restore() }, [client])
  return { ...state, client, track, sandbox: runtime.sandbox, paymentDiagnostics }
}
