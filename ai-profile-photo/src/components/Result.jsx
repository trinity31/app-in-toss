import { useState, useEffect } from 'react';
import { theme, primaryButton, secondaryButton } from '../styles/theme';

export default function Result({ images = [], failedStyles = [], onRetryFailed, typeName, onSave, onSaveAll, onRetry, hasPendingOrder, onRestore, onDismissPending, error, onDismissError }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewingIndex, setViewingIndex] = useState(-1);
  const viewingImage = viewingIndex >= 0 ? images[viewingIndex] : null;

  const showPrev = () => setViewingIndex(i => (i > 0 ? i - 1 : images.length - 1));
  const showNext = () => setViewingIndex(i => (i < images.length - 1 ? i + 1 : 0));

  const handleSave = async (imageId) => {
    setSaving(true);
    try { await onSave(imageId); } finally { setSaving(false); }
  };
  const handleSaveAll = async () => {
    setSaving(true);
    try { await onSaveAll(); } finally { setSaving(false); }
  };

  useEffect(() => {
    if (revealedCount >= images.length) return;
    const timer = setTimeout(() => setRevealedCount(prev => prev + 1), revealedCount === 0 ? 300 : 400);
    return () => clearTimeout(timer);
  }, [revealedCount, images.length]);

  const allRevealed = revealedCount >= images.length;

  return (
    <div style={styles.container}>
      {error && (
        <div style={styles.errorBanner}>
          <p style={styles.errorText}>{error}</p>
          <button style={styles.errorClose} onClick={onDismissError}>✕</button>
        </div>
      )}

      {hasPendingOrder && onRestore && (
        <div style={styles.pendingBanner}>
          <div style={styles.pendingIcon}>⚠️</div>
          <div style={styles.pendingContent}>
            <p style={styles.pendingTitle}>완료되지 않은 주문이 있어요</p>
            <p style={styles.pendingDesc}>추가 결제 없이 다시 생성할 수 있어요</p>
          </div>
          <div style={styles.pendingActions}>
            <button style={styles.pendingRestoreBtn} onClick={onRestore}>다시 생성</button>
            {onDismissPending && (
              <button style={styles.pendingDismissBtn} onClick={onDismissPending}>무시</button>
            )}
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div style={styles.header}>
          <h1 style={styles.title}>완성!</h1>
          <p style={styles.subtitle}>
            {failedStyles.length > 0
              ? `${images.length + failedStyles.length}장 중 ${images.length}장 완성!`
              : `${typeName} · ${images.length}장`}
          </p>
          <p style={styles.headerHint}>사진을 터치하면 크게 볼 수 있어요</p>
        </div>
      )}

      <div style={styles.gallery}>
        {images.map((img, i) => {
          const isRevealed = i < revealedCount;
          const isSelected = selectedId === img.id;
          return (
            <button key={img.id} style={{ ...styles.card, ...(isSelected ? styles.cardSelected : {}) }}
              onClick={() => setSelectedId(isSelected ? null : img.id)}>
              <div
                style={styles.imageWrap}
                onClick={(e) => {
                  if (isRevealed) {
                    e.stopPropagation();
                    setViewingIndex(i);
                  }
                }}
              >
                <img src={img.imageUrl} alt={img.label} style={{
                  ...styles.image,
                  filter: isRevealed ? 'blur(0)' : 'blur(20px)',
                  opacity: isRevealed ? 1 : 0,
                  transform: isRevealed ? 'scale(1)' : 'scale(1.05)',
                }} />
              </div>
              {isSelected && (
                <div style={styles.cardActions}>
                  <button style={{...styles.cardActionBtn, opacity: saving ? 0.5 : 1}} disabled={saving}
                    onClick={(e) => { e.stopPropagation(); handleSave(img.id); }}>저장</button>
                </div>
              )}
            </button>
          );
        })}
        {failedStyles.map((fs) => (
          <div key={fs.id} style={styles.failedCard}>
            <div style={styles.failedImageWrap}>
              <div style={styles.failedContent}>
                <span style={styles.failedIcon}>!</span>
                <p style={styles.failedLabel}>{fs.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {failedStyles.length > 0 && allRevealed && onRetryFailed && (
        <div style={styles.retryFailedArea}>
          <p style={styles.retryFailedText}>{failedStyles.length}장 생성에 실패했어요</p>
          <button style={styles.retryFailedBtn} onClick={onRetryFailed}>실패한 사진 다시 만들기</button>
        </div>
      )}

      {/* 풀스크린 이미지 뷰어 */}
      {viewingImage && (
        <div style={styles.overlay} onClick={() => setViewingIndex(-1)}>
          <button style={styles.navButton} onClick={(e) => { e.stopPropagation(); showPrev(); }}>
            <span style={styles.navArrow}>&#8249;</span>
          </button>
          <img
            src={viewingImage.imageUrl}
            alt={viewingImage.label}
            style={styles.overlayImage}
            onClick={(e) => e.stopPropagation()}
          />
          <button style={{...styles.navButton, left: 'auto', right: '8px'}} onClick={(e) => { e.stopPropagation(); showNext(); }}>
            <span style={styles.navArrow}>&#8250;</span>
          </button>
          <button style={styles.closeButton} onClick={() => setViewingIndex(-1)}>✕</button>
          <div style={styles.overlayActions}>
            <button
              style={{...styles.overlayActionBtn, opacity: saving ? 0.5 : 1}}
              disabled={saving}
              onClick={(e) => { e.stopPropagation(); handleSave(viewingImage.id); }}
            >
              저장
            </button>
          </div>
        </div>
      )}

      {allRevealed && (
        <div style={styles.bottomArea}>
          <p style={styles.bottomHint}>만든 사진 보기에서 나중에 다시 볼 수 있어요</p>
          <button style={{...styles.saveAllButton, opacity: saving ? 0.5 : 1}} disabled={saving} onClick={handleSaveAll}>
            {saving ? '저장 중...' : '전체 저장하기'}
          </button>
          <button style={styles.retryButton} onClick={onRetry}>다른 유형으로 만들기</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100dvh', width: '100%', padding: '20px', paddingBottom: '160px',
    backgroundColor: theme.color.bg, boxSizing: 'border-box',
  },
  errorBanner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    width: '100%', maxWidth: '400px', marginTop: '16px',
    padding: '12px 16px', borderRadius: theme.radius.md,
    backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2',
    animation: 'fadeIn 300ms ease both',
  },
  errorText: {
    fontSize: theme.font.size.caption, color: '#C62828', margin: 0, flex: 1,
  },
  errorClose: {
    background: 'none', border: 'none', color: '#C62828', fontSize: '16px',
    cursor: 'pointer', padding: '4px', marginLeft: '8px', flexShrink: 0,
  },
  header: {
    textAlign: 'center', marginTop: '20px', marginBottom: '24px',
    animation: 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  title: { fontSize: theme.font.size.hero, fontWeight: theme.font.weight.bold, color: theme.color.textPrimary, margin: 0 },
  subtitle: { fontSize: theme.font.size.caption, color: theme.color.textSecondary, margin: '6px 0 0 0' },
  headerHint: { fontSize: theme.font.size.small, color: theme.color.textTertiary, margin: '4px 0 0 0' },
  gallery: {
    display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px',
    width: '100%', maxWidth: '400px',
  },
  card: {
    background: 'none', border: '2px solid transparent', borderRadius: theme.radius.lg,
    padding: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column',
    transition: `border-color ${theme.motion.fast} ease`,
  },
  cardSelected: { borderColor: theme.color.primary },
  imageWrap: { width: '100%', aspectRatio: '3/4', borderRadius: theme.radius.md, overflow: 'hidden', backgroundColor: theme.color.bgSecondary },
  image: {
    width: '100%', height: '100%', objectFit: 'cover',
    transition: 'filter 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
  cardActions: { display: 'flex', gap: '8px', padding: '8px 4px 4px', animation: 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both' },
  cardActionBtn: {
    flex: 1, padding: '8px', fontSize: theme.font.size.small, fontWeight: theme.font.weight.semibold,
    color: theme.color.primary, backgroundColor: theme.color.primaryLight,
    border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer',
  },

  /* ── 실패 placeholder ── */
  failedCard: {
    display: 'flex', flexDirection: 'column',
    borderRadius: theme.radius.lg, padding: 0,
  },
  failedImageWrap: {
    width: '100%', aspectRatio: '3/4', borderRadius: theme.radius.md, overflow: 'hidden',
    backgroundColor: theme.color.bgSecondary, border: '2px dashed #FFCC80',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxSizing: 'border-box',
  },
  failedContent: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
  },
  failedIcon: {
    width: '28px', height: '28px', borderRadius: '50%',
    backgroundColor: '#FFE0B2', color: '#E65100',
    fontSize: theme.font.size.caption, fontWeight: theme.font.weight.bold,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  failedLabel: {
    fontSize: theme.font.size.small, color: theme.color.textTertiary, margin: 0,
    textAlign: 'center', wordBreak: 'keep-all',
  },
  retryFailedArea: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    width: '100%', maxWidth: '400px', marginTop: '16px',
    padding: '16px', borderRadius: theme.radius.md,
    backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2',
  },
  retryFailedText: {
    fontSize: theme.font.size.caption, color: '#E65100',
    fontWeight: theme.font.weight.semibold, margin: 0,
  },
  retryFailedBtn: {
    width: '100%', padding: '12px', fontSize: theme.font.size.caption,
    fontWeight: theme.font.weight.bold, color: '#fff',
    backgroundColor: '#E65100', border: 'none',
    borderRadius: theme.radius.sm, cursor: 'pointer',
  },

  bottomArea: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    padding: '12px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
    backgroundColor: 'rgba(253, 251, 250, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    animation: 'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  bottomHint: {
    fontSize: theme.font.size.small, color: theme.color.textTertiary,
    margin: '0 0 8px 0', textAlign: 'center',
  },
  saveAllButton: { ...primaryButton, width: '100%', maxWidth: '400px', padding: '16px' },
  retryButton: {
    ...secondaryButton, width: '100%', maxWidth: '400px', padding: '12px',
    backgroundColor: 'transparent', color: theme.color.textTertiary, fontSize: theme.font.size.caption,
  },

  /* ── 미완료 주문 배너 ── */
  pendingBanner: {
    display: 'flex', flexDirection: 'column', gap: '12px',
    width: '100%', maxWidth: '400px', marginTop: '20px',
    padding: '20px', borderRadius: theme.radius.md,
    backgroundColor: '#FFF3E0', border: '1px solid #FFE0B2',
    animation: 'fadeIn 500ms ease both',
  },
  pendingIcon: { fontSize: '28px' },
  pendingContent: { display: 'flex', flexDirection: 'column', gap: '4px' },
  pendingTitle: {
    fontSize: theme.font.size.body, fontWeight: theme.font.weight.bold,
    color: '#E65100', margin: 0,
  },
  pendingDesc: {
    fontSize: theme.font.size.caption, color: '#BF360C', margin: 0,
  },
  pendingActions: { display: 'flex', gap: '8px', marginTop: '4px' },
  pendingRestoreBtn: {
    flex: 1, padding: '14px', fontSize: theme.font.size.body,
    fontWeight: theme.font.weight.bold, color: '#fff',
    backgroundColor: '#E65100', border: 'none',
    borderRadius: theme.radius.sm, cursor: 'pointer',
  },
  pendingDismissBtn: {
    padding: '14px 20px', fontSize: theme.font.size.caption,
    fontWeight: theme.font.weight.semibold, color: '#BF360C',
    backgroundColor: 'transparent', border: '1px solid #FFCC80',
    borderRadius: theme.radius.sm, cursor: 'pointer',
  },

  /* ── 풀스크린 뷰어 ── */
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.92)', zIndex: 1000,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    animation: 'fadeIn 200ms ease both',
  },
  overlayImage: { maxWidth: '90vw', maxHeight: '75vh', objectFit: 'contain', borderRadius: theme.radius.md },
  closeButton: {
    position: 'absolute', top: 'max(16px, env(safe-area-inset-top))', right: '16px',
    width: '36px', height: '36px', borderRadius: '50%', border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '18px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  navButton: {
    position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
    width: '44px', height: '44px', borderRadius: '50%', border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#fff', fontSize: '28px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001,
  },
  navArrow: { lineHeight: 1, marginTop: '-2px' },
  overlayActions: { display: 'flex', gap: '12px', marginTop: '20px' },
  overlayActionBtn: {
    padding: '12px 32px', fontSize: theme.font.size.body, fontWeight: theme.font.weight.semibold,
    color: '#fff', backgroundColor: theme.color.primary, border: 'none',
    borderRadius: theme.radius.full, cursor: 'pointer',
  },
};
