export default function PurchasePromotion({ promotion, compact = false }) {
  if (!promotion) return null

  return (
    <div style={{ margin: compact ? '12px 0 8px' : '0 0 14px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '6px 8px' }}>
        <strong style={{ background: 'var(--color-primary)', color: 'var(--color-white)', borderRadius: '6px', padding: '5px 8px', fontSize: '14px' }}>
          기간 한정 50% 할인
        </strong>
        <span style={{ fontSize: '13px', color: 'var(--color-gray-700)' }}>10월 21일까지</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 8px', marginTop: '8px' }}>
        <del style={{ fontSize: '15px', color: 'var(--color-gray-600)' }}>{promotion.originalAmount.toLocaleString('ko-KR')}원</del>
        <strong style={{ fontSize: compact ? '24px' : '28px', color: 'var(--color-primary)' }}>{promotion.discountedAmount.toLocaleString('ko-KR')}원</strong>
        <span style={{ fontSize: '13px', color: 'var(--color-gray-700)' }}>할인 적용 시</span>
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.5, color: 'var(--color-gray-700)', wordBreak: 'keep-all', overflowWrap: 'anywhere' }}>
        상품별 1인 1회 할인 · 할인 구매 이력이 있으면 정가 적용<br />
        최종 결제 금액은 토스 결제창에서 확인해 주세요.
      </p>
    </div>
  )
}
