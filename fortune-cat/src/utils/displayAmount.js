/**
 * displayAmount('1,200원')에서 숫자 금액만 추출한다. SDK가 숫자 필드를 주지 않아 파싱이 필요.
 * @returns {number|null} 파싱 실패 시 null
 */
export function parseDisplayAmount(displayAmount) {
  const digits = String(displayAmount ?? '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  const amount = Number(digits);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}
