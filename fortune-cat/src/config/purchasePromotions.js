// Console policies are presentation metadata, never checkout or grant amounts.
export const PROMOTION_START = Date.parse('2026-09-22T00:00:00+09:00')
export const PROMOTION_END = Date.parse('2026-10-22T00:00:00+09:00')

export const PURCHASE_PROMOTIONS = {
  followup_pack: { policyId: 855, originalAmount: 1980, discountedAmount: 990 },
  deep_reading: { policyId: 857, originalAmount: 4950, discountedAmount: 2475 },
}

export function isPurchasePromotionActive(now = Date.now()) {
  return now >= PROMOTION_START && now < PROMOTION_END
}
