import { useState, useEffect } from 'react';
import { theme, primaryButton, secondaryButton } from '../styles/theme';

/**
 * Result — 6장 세트 결과 갤러리
 *
 * props.images:     Array<{ id, label, imageUrl }> — 생성된 이미지 목록
 * props.typeName:   프로필 타입 이름
 * props.onSave:     (imageId) => void — 개별 저장
 * props.onSaveAll:  () => void — 전체 저장
 * props.onShare:    (imageId) => void — 개별 공유
 * props.onRetry:    () => void — 처음으로
 */
export default function Result({ images = [], typeName, onSave, onSaveAll, onShare, onRetry }) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (imageId) => {
    setSaving(true);
    try { await onSave(imageId); } finally { setSaving(false); }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try { await onSaveAll(); } finally { setSaving(false); }
  };

  const handleShare = async (imageId) => {
    setSaving(true);
    try { await onShare(imageId); } finally { setSaving(false); }
  };

  // 순차적 공개 애니메이션
  useEffect(() => {
    if (revealedCount >= images.length) return;

    const timer = setTimeout(() => {
      setRevealedCount(prev => prev + 1);
    }, revealedCount === 0 ? 300 : 400);

    return () => clearTimeout(timer);
  }, [revealedCount, images.length]);

  const allRevealed = revealedCount >= images.length;

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.title}>완성!</h1>
        <p style={styles.subtitle}>{typeName} · {images.length}장</p>
      </div>

      {/* 이미지 갤러리 */}
      <div style={styles.gallery}>
        {images.map((img, i) => {
          const isRevealed = i < revealedCount;
          const isSelected = selectedId === img.id;

          return (
            <button
              key={img.id}
              style={{
                ...styles.card,
                ...(isSelected ? styles.cardSelected : {}),
              }}
              onClick={() => setSelectedId(isSelected ? null : img.id)}
            >
              <div style={styles.imageWrap}>
                <img
                  src={img.imageUrl}
                  alt={img.label}
                  style={{
                    ...styles.image,
                    filter: isRevealed ? 'blur(0)' : 'blur(20px)',
                    opacity: isRevealed ? 1 : 0,
                    transform: isRevealed ? 'scale(1)' : 'scale(1.05)',
                  }}
                />
              </div>
              {/* 개별 액션 */}
              {isSelected && (
                <div style={styles.cardActions}>
                  <button
                    style={{...styles.cardActionBtn, opacity: saving ? 0.5 : 1}}
                    disabled={saving}
                    onClick={(e) => { e.stopPropagation(); handleSave(img.id); }}
                  >
                    저장
                  </button>
                  <button
                    style={{...styles.cardActionBtn, opacity: saving ? 0.5 : 1}}
                    disabled={saving}
                    onClick={(e) => { e.stopPropagation(); handleShare(img.id); }}
                  >
                    공유
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 하단 액션 */}
      {allRevealed && (
        <div style={styles.bottomArea}>
          <button
            style={{...styles.saveAllButton, opacity: saving ? 0.5 : 1}}
            disabled={saving}
            onClick={handleSaveAll}
          >
            {saving ? '저장 중...' : '전체 저장하기'}
          </button>
          <button style={styles.retryButton} onClick={onRetry}>
            다른 유형으로 만들기
          </button>
        </div>
      )}
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
  title: {
    fontSize: theme.font.size.hero,
    fontWeight: theme.font.weight.bold,
    color: theme.color.textPrimary,
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: theme.font.size.caption,
    color: theme.color.textTertiary,
    margin: '6px 0 0 0',
  },

  /* ── 갤러리 ── */
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
  },
  card: {
    background: 'none',
    border: '2px solid transparent',
    borderRadius: theme.radius.lg,
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: `border-color ${theme.motion.fast} ease`,
  },
  cardSelected: {
    borderColor: theme.color.primary,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: '3/4',
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.color.bgSecondary,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'filter 800ms cubic-bezier(0.16, 1, 0.3, 1), opacity 800ms cubic-bezier(0.16, 1, 0.3, 1), transform 800ms cubic-bezier(0.16, 1, 0.3, 1)',
  },
  /* ── 개별 액션 ── */
  cardActions: {
    display: 'flex',
    gap: '8px',
    padding: '8px 4px 4px',
    animation: 'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  cardActionBtn: {
    flex: 1,
    padding: '8px',
    fontSize: theme.font.size.small,
    fontWeight: theme.font.weight.semibold,
    color: theme.color.primary,
    backgroundColor: theme.color.primaryLight,
    border: 'none',
    borderRadius: theme.radius.sm,
    cursor: 'pointer',
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
    animation: 'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  saveAllButton: {
    ...primaryButton,
    width: '100%',
    maxWidth: '400px',
    padding: '16px',
  },
  retryButton: {
    ...secondaryButton,
    width: '100%',
    maxWidth: '400px',
    padding: '12px',
    backgroundColor: 'transparent',
    color: theme.color.textTertiary,
    fontSize: theme.font.size.caption,
  },
};
