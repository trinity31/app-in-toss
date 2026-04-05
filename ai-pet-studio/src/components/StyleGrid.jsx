import { theme, primaryButton, secondaryButton } from '../styles/theme';

export default function StyleGrid({ samples = [], onPurchase, onBack }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>어떤 모습이 나올까?</h1>
        <p style={styles.subtitle}>매번 다른 스타일로 9장을 만들어 드려요</p>
      </div>

      <div style={styles.grid}>
        {samples.map((item, i) => (
          <div key={item.id} style={{ ...styles.card, animationDelay: `${i * 50}ms` }}>
            <img src={item.sampleUrl} alt="" style={styles.image} loading="lazy" />
          </div>
        ))}
      </div>

      <div style={styles.luckyBanner}>
        <span style={styles.luckyIcon}>🎰</span>
        <p style={styles.luckyText}>
          피규어, 명화, 디즈니 등 다양한 스타일이<br />
          랜덤으로 만들어져요!
        </p>
      </div>

      <div style={styles.bottomArea}>
        <button style={styles.purchaseButton} onClick={onPurchase}>
          9장 세트 뽑기
        </button>
        <button style={styles.backButton} onClick={onBack}>
          사진 다시 선택
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100dvh', width: '100%', padding: '20px', paddingBottom: '160px',
    backgroundColor: theme.color.bg, boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center', marginTop: '20px', marginBottom: '24px',
    animation: 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  title: {
    fontSize: theme.font.size.title, fontWeight: theme.font.weight.bold,
    color: theme.color.textPrimary, margin: 0, lineHeight: theme.font.lineHeight.tight,
  },
  subtitle: {
    fontSize: theme.font.size.caption, color: theme.color.textTertiary,
    margin: '8px 0 0 0', lineHeight: theme.font.lineHeight.normal,
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px',
    width: '100%', maxWidth: '360px',
  },
  card: {
    aspectRatio: '3/4', borderRadius: theme.radius.sm, overflow: 'hidden',
    backgroundColor: theme.color.bgSecondary,
    animation: 'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  luckyBanner: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    marginTop: '20px', padding: '14px 16px',
    backgroundColor: theme.color.accentLight, borderRadius: theme.radius.md,
    width: '100%', maxWidth: '360px',
    animation: 'fadeIn 400ms 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  luckyIcon: { fontSize: '20px', flexShrink: 0, lineHeight: 1.4 },
  luckyText: {
    fontSize: theme.font.size.small, fontWeight: theme.font.weight.medium,
    color: theme.color.accent, margin: 0, lineHeight: theme.font.lineHeight.normal,
  },
  bottomArea: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    padding: '12px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
    backgroundColor: 'rgba(255, 251, 248, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  purchaseButton: { ...primaryButton, width: '100%', maxWidth: '400px', padding: '16px' },
  backButton: { ...secondaryButton, width: '100%', maxWidth: '400px', padding: '12px', backgroundColor: 'transparent', color: theme.color.textTertiary, fontSize: theme.font.size.caption },
};
