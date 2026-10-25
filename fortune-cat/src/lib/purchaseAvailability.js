export const PURCHASE_UNAVAILABLE_MESSAGE = '결제 안전 점검 중이에요. 지금은 새 결제를 진행할 수 없어요. 이전 결제 내역은 보관되며, 복구가 필요하면 문의해 주세요.'
export function rejectUnavailablePurchase() {
  const error = new Error(PURCHASE_UNAVAILABLE_MESSAGE)
  error.code = 'purchase_owner_verification_unavailable'
  throw error
}
