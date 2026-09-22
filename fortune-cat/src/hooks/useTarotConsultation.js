import { useEffect, useState, useSyncExternalStore } from 'react'
import { Storage } from '@apps-in-toss/web-framework'
import { createTarotConsultation } from '../lib/tarotConsultation'

const storage = {
  async getItem(key) {
    try { return await Storage.getItem(key) }
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
  const [client] = useState(() => createTarotConsultation({ baseUrl: import.meta.env.VITE_API_BASE_URL, storage }))
  const state = useSyncExternalStore(client.subscribe, client.getSnapshot)
  useEffect(() => { client.restore() }, [client])
  return { ...state, client }
}
