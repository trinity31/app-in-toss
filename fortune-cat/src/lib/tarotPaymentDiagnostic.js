const ERROR_CODES = new Set([
  'INVALID_PRODUCT_ID', 'PAYMENT_PENDING', 'NETWORK_ERROR', 'INVALID_USER_ENVIRONMENT',
  'ITEM_ALREADY_OWNED', 'APP_MARKET_VERIFICATION_FAILED', 'TOSS_SERVER_VERIFICATION_FAILED',
  'INTERNAL_ERROR', 'KOREAN_ACCOUNT_ONLY', 'USER_CANCELED', 'PRODUCT_NOT_GRANTED_BY_PARTNER',
  'UNSUPPORTED_APP_VERSION', 'RECOVERY_NOT_CONFIRMED',
])

export function createPaymentDiagnosticReporter(report = () => {}) {
  const startedAt = Date.now()
  const attemptId = globalThis.crypto?.randomUUID?.() || `payment-${startedAt.toString(36)}-${Math.random().toString(36).slice(2)}`
  return (stage, error) => {
    const event = {
      attempt_id: attemptId,
      stage,
      occurred_at: new Date().toISOString(),
      elapsed_ms: Math.max(0, Date.now() - startedAt),
    }
    if (error !== undefined) {
      // Native messages/payloads can contain private data; only known codes leave the app.
      event.error_code = ERROR_CODES.has(error?.code) ? error.code : 'UNKNOWN'
      if (Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599) {
        event.http_status = error.status
      }
    }
    try { Promise.resolve(report(event)).catch(() => {}) } catch { /* Diagnostics cannot fail payment. */ }
  }
}
