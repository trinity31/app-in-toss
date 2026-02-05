import { useState, useEffect } from 'react'

const STORAGE_KEY = 'newyear_pending_order_data'

// 개발/테스트용: 콘솔에서 window.clearPendingOrderData() 로 삭제 가능
if (typeof window !== 'undefined') {
  window.clearPendingOrderData = () => {
    localStorage.removeItem(STORAGE_KEY)
    console.log('[PendingOrderStorage] 데이터 삭제됨. 앱을 새로고침하세요.')
  }
  window.getPendingOrderData = () => {
    const data = localStorage.getItem(STORAGE_KEY)
    console.log('[PendingOrderStorage] 저장된 데이터:', data ? JSON.parse(data) : null)
    return data ? JSON.parse(data) : null
  }
  window.skipAutoRestore = () => {
    sessionStorage.setItem('skip_auto_restore', 'true')
    console.log('[PendingOrderStorage] 자동 복원 건너뛰기 활성화. 앱을 새로고침하세요.')
  }
  window.enableAutoRestore = () => {
    sessionStorage.removeItem('skip_auto_restore')
    console.log('[PendingOrderStorage] 자동 복원 다시 활성화. 앱을 새로고침하세요.')
  }
}

export function shouldSkipAutoRestore() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem('skip_auto_restore') === 'true'
}

export function usePendingOrderStorage() {
  const [loading, setLoading] = useState(true)
  const [pendingOrderData, setPendingOrderData] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setPendingOrderData(JSON.parse(stored))
      }
    } catch (err) {
      console.error('[usePendingOrderStorage] 로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const savePendingOrderData = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setPendingOrderData(data)
    } catch (err) {
      console.error('[usePendingOrderStorage] 저장 실패:', err)
    }
  }

  const clearPendingOrderData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      setPendingOrderData(null)
    } catch (err) {
      console.error('[usePendingOrderStorage] 삭제 실패:', err)
    }
  }

  return {
    loading,
    pendingOrderData,
    savePendingOrderData,
    clearPendingOrderData,
  }
}
