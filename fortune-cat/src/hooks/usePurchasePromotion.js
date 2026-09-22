import { useEffect, useState } from 'react'
import {
  PROMOTION_START,
  PROMOTION_END,
  PURCHASE_PROMOTIONS,
  isPurchasePromotionActive,
} from '../config/purchasePromotions'

export function usePurchasePromotion() {
  const [active, setActive] = useState(() => isPurchasePromotionActive())

  useEffect(() => {
    let timer
    const refresh = () => {
      clearTimeout(timer)
      const now = Date.now()
      setActive(isPurchasePromotionActive(now))
      const boundary = now < PROMOTION_START ? PROMOTION_START : PROMOTION_END
      if (now < boundary) {
        // Long campaigns exceed the browser timer limit; recheck at least daily.
        timer = setTimeout(refresh, Math.min(boundary - now, 24 * 60 * 60 * 1000))
      }
    }
    refresh()
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('pageshow', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('pageshow', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return active ? PURCHASE_PROMOTIONS : {}
}
