export default function PurchasePromotion({ promotion, compact = false }) {
  if (!promotion) return null

  return (
    <div style={{ margin: compact ? '12px 0 8px' : '0 0 14px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px 8px' }}>
        <del style={{ fontSize: '15px', color: 'var(--color-gray-600)' }}>{promotion.originalAmount.toLocaleString('ko-KR')}원</del>
        <strong style={{ fontSize: compact ? '24px' : '28px', color: 'var(--color-primary)' }}>{promotion.discountedAmount.toLocaleString('ko-KR')}원</strong>
        <span style={{ fontSize: '13px', color: 'var(--color-gray-700)' }}>할인 적용 시</span>
      </div>
    </div>
  )
}
