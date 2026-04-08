import { theme, primaryButton, secondaryButton } from '../styles/theme';

/**
 * StyleGrid — 샘플 쇼케이스 + 세트 구매 유도 (뽑기 컨셉)
 *
 * props.samples:   Array<{ id, sampleUrl }>
 * props.typeName:  선택된 프로필 타입 이름
 * props.onPurchase: () => void
 * props.onBack:     () => void
 */
export default function StyleGrid({ samples = [], typeName, onPurchase, onBack, error, onDismissError }) {
  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.errorToast}>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.errorClose} onClick={onDismissError}>✕</button>
        </div>
      )}

      {/* 헤더 */}
      <div style={styles.header}>
        <p style={styles.typeTag}>{typeName}</p>
        <h1 style={styles.title}>
          어떤 사진이 나올까?
        </h1>
        <p style={styles.subtitle}>
          매번 다른 스타일로 6장을 만들어 드려요
        </p>
      </div>

      {/* 샘플 그리드 — 이미지만, 라벨 없음 */}
      <div style={styles.grid}>
        {samples.map((item, i) => (
          <div
            key={item.id}
            style={{
              ...styles.card,
              animationDelay: `${i * 50}ms`,
            }}
          >
            <img
              src={item.sampleUrl}
              alt=""
              style={styles.image}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* 뽑기 안내 */}
      <div style={styles.luckyBanner}>
        <span style={styles.luckyIcon}>🎰</span>
        <p style={styles.luckyText}>
          조명, 배경, 분위기가 랜덤으로 조합돼요<br />
          어떤 조합이 나올지는 열어봐야 알 수 있어요!
        </p>
      </div>

      {/* 하단 구매 영역 */}
      <div style={styles.bottomArea}>
        <button style={styles.purchaseButton} onClick={onPurchase}>
          6장 세트 뽑기
        </button>
        <button style={styles.backButton} onClick={onBack}>
          다른 유형 보기
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100dvh',
    width: '100%',
    padding: '20px',
    paddingBottom: '160px',
    backgroundColor: theme.color.bg,
    boxSizing: 'border-box',
  },

  /* ── 헤더 ── */
  header: {
    textAlign: 'center',
    marginTop: '20px',
    marginBottom: '24px',
    animation: 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  typeTag: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: theme.color.primaryLight,
    color: theme.color.primary,
    borderRadius: theme.radius.full,
    fontSize: theme.font.size.small,
    fontWeight: theme.font.weight.semibold,
    margin: '0 0 12px 0',
  },
  title: {
    fontSize: theme.font.size.title,
    fontWeight: theme.font.weight.bold,
    color: theme.color.textPrimary,
    margin: 0,
    lineHeight: theme.font.lineHeight.tight,
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: theme.font.size.caption,
    color: theme.color.textTertiary,
    margin: '8px 0 0 0',
    lineHeight: theme.font.lineHeight.normal,
  },

  /* ── 그리드 ── */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '5px',
    width: '100%',
    maxWidth: '360px',
  },
  card: {
    aspectRatio: '3/4',
    borderRadius: theme.radius.sm,
    overflow: 'hidden',
    backgroundColor: theme.color.bgSecondary,
    animation: 'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  /* ── 뽑기 안내 ── */
  luckyBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginTop: '20px',
    padding: '14px 16px',
    backgroundColor: theme.color.accentLight,
    borderRadius: theme.radius.md,
    width: '100%',
    maxWidth: '360px',
    animation: 'fadeIn 400ms 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  luckyIcon: {
    fontSize: '20px',
    flexShrink: 0,
    lineHeight: 1.4,
  },
  luckyText: {
    fontSize: theme.font.size.small,
    fontWeight: theme.font.weight.medium,
    color: theme.color.accent,
    margin: 0,
    lineHeight: theme.font.lineHeight.normal,
  },

  /* ── 에러 토스트 ── */
  errorToast: {
    position: 'fixed', bottom: '140px', left: '20px', right: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    maxWidth: '400px', margin: '0 auto',
    padding: '14px 16px', borderRadius: theme.radius.md,
    backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 999,
    animation: 'fadeUp 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  errorText: {
    fontSize: theme.font.size.caption, color: '#C62828', margin: 0, flex: 1,
  },
  errorClose: {
    background: 'none', border: 'none', color: '#C62828', fontSize: '16px',
    cursor: 'pointer', padding: '4px', marginLeft: '8px', flexShrink: 0,
  },

  /* ── 하단 ── */
  bottomArea: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px 20px',
    paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
    backgroundColor: 'rgba(253, 251, 250, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  purchaseButton: {
    ...primaryButton,
    width: '100%',
    maxWidth: '400px',
    padding: '16px',
  },
  backButton: {
    ...secondaryButton,
    width: '100%',
    maxWidth: '400px',
    padding: '12px',
    backgroundColor: 'transparent',
    color: theme.color.textTertiary,
    fontSize: theme.font.size.caption,
  },
};
