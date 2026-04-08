import { useState, useEffect } from 'react';
import { saveBase64Data } from '@apps-in-toss/web-framework';
import { theme, primaryButton } from '../styles/theme';
import { IMAGE_ENDPOINTS, IMAGE_BUCKET } from '../config/api';

export default function History({ userId, onBack, onRetryFailed }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewingIndex, setViewingIndex] = useState(-1);
  const viewingImage = viewingIndex >= 0 ? images[viewingIndex] : null;

  const showPrev = () => setViewingIndex(i => (i > 0 ? i - 1 : images.length - 1));
  const showNext = () => setViewingIndex(i => (i < images.length - 1 ? i + 1 : 0));

  useEffect(() => {
    fetchImages();
  }, [userId]);

  const fetchImages = async () => {
    const url = `${IMAGE_ENDPOINTS.LIST}?userId=${encodeURIComponent(userId)}&bucket=${IMAGE_BUCKET}`;
    console.log('[History] 조회 URL:', url);
    console.log('[History] userId:', userId);
    try {
      const res = await fetch(url);
      console.log('[History] 응답 상태:', res.status);
      const data = await res.json();
      console.log('[History] 응답 데이터:', JSON.stringify(data));
      if (data.success) {
        setImages(data.images || []);
      }
    } catch (err) {
      console.error('이미지 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (image) => {
    if (typeof saveBase64Data !== 'function') return;
    setSaving(true);
    try {
      const res = await fetch(image.url);
      const blob = await res.blob();
      const reader = new FileReader();
      const base64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(blob);
      });
      await saveBase64Data({
        data: base64,
        fileName: `pet_${image.cardType}_${Date.now()}.png`,
        mimeType: 'image/png',
      });
    } catch (err) {
      if (!err.message?.toLowerCase().includes('cancel')) {
        console.error('저장 실패:', err);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (image) => {
    try {
      const res = await fetch(
        `${IMAGE_ENDPOINTS.DELETE}?userId=${encodeURIComponent(userId)}&filePath=${encodeURIComponent(image.id)}&bucket=${IMAGE_BUCKET}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (data.success) {
        setImages(prev => prev.filter(img => img.id !== image.id));
      }
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>← 돌아가기</button>
        <h1 style={styles.title}>만든 사진</h1>
      </div>

      {/* 미완성 세트 재생성 카드 */}
      {localStorage.getItem('pet_profile_failed_styles') && onRetryFailed && (
        <div style={styles.retryCard}>
          <p style={styles.retryText}>이전에 생성하지 못한 사진이 있어요</p>
          <button style={styles.retryButton} onClick={onRetryFailed}>
            재생성하기
          </button>
        </div>
      )}

      {images.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>아직 만든 사진이 없어요</p>
        </div>
      ) : (
        <div style={styles.gallery}>
          {images.map((img, i) => (
            <div key={img.id} style={styles.card}>
              <div
                style={styles.imageWrap}
                onClick={() => setViewingIndex(i)}
              >
                <img src={img.url} alt="" style={styles.image} loading="lazy" />
              </div>
              <div style={styles.cardInfo}>
                <span style={styles.cardDate}>{formatDate(img.createdAt)}</span>
                <div style={styles.cardActions}>
                  <button
                    style={styles.actionBtn}
                    onClick={() => handleSave(img)}
                    disabled={saving}
                  >
                    저장
                  </button>
                  <button
                    style={{...styles.actionBtn, color: theme.color.error}}
                    onClick={() => handleDelete(img)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 풀스크린 뷰어 */}
      {viewingImage && (
        <div style={styles.overlay} onClick={() => setViewingIndex(-1)}>
          <button style={styles.navButton} onClick={(e) => { e.stopPropagation(); showPrev(); }}>
            <span style={styles.navArrow}>&#8249;</span>
          </button>
          <img src={viewingImage.url} alt="" style={styles.overlayImage} onClick={(e) => e.stopPropagation()} />
          <button style={{...styles.navButton, left: 'auto', right: '8px'}} onClick={(e) => { e.stopPropagation(); showNext(); }}>
            <span style={styles.navArrow}>&#8250;</span>
          </button>
          <button style={styles.closeButton} onClick={() => setViewingIndex(-1)}>✕</button>
          <div style={styles.overlayActions}>
            <button
              style={{...styles.overlayActionBtn, opacity: saving ? 0.5 : 1}}
              disabled={saving}
              onClick={(e) => { e.stopPropagation(); handleSave(viewingImage); }}
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100dvh', width: '100%', padding: '20px',
    backgroundColor: theme.color.bg, boxSizing: 'border-box',
  },
  header: {
    width: '100%', maxWidth: '400px', marginBottom: '20px',
  },
  backButton: {
    background: 'none', border: 'none', padding: '8px 0',
    fontSize: theme.font.size.body, color: theme.color.primary,
    cursor: 'pointer', fontWeight: theme.font.weight.semibold,
  },
  title: {
    fontSize: theme.font.size.title, fontWeight: theme.font.weight.bold,
    color: theme.color.textPrimary, margin: '8px 0 0 0',
  },
  loadingText: {
    fontSize: theme.font.size.body, color: theme.color.textTertiary,
    marginTop: '100px',
  },
  empty: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flex: 1, marginTop: '80px',
  },
  emptyText: {
    fontSize: theme.font.size.body, color: theme.color.textTertiary,
  },
  gallery: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
    width: '100%', maxWidth: '400px',
  },
  card: {
    display: 'flex', flexDirection: 'column',
    borderRadius: theme.radius.md, overflow: 'hidden',
    backgroundColor: theme.color.surface,
  },
  imageWrap: {
    width: '100%', aspectRatio: '2/3', cursor: 'pointer',
    overflow: 'hidden',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  cardInfo: {
    padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px',
  },
  cardDate: {
    fontSize: theme.font.size.small, color: theme.color.textTertiary,
  },
  cardActions: { display: 'flex', gap: '4px' },
  actionBtn: {
    flex: 1, padding: '4px', fontSize: '11px',
    fontWeight: theme.font.weight.semibold,
    color: theme.color.primary, backgroundColor: theme.color.primaryLight,
    border: 'none', borderRadius: theme.radius.sm, cursor: 'pointer',
  },

  /* 재생성 카드 */
  retryCard: {
    width: '100%', maxWidth: '400px', padding: '16px',
    backgroundColor: theme.color.primaryLight, borderRadius: theme.radius.md,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '12px', marginBottom: '16px',
  },
  retryText: {
    fontSize: theme.font.size.caption, color: theme.color.textPrimary,
    margin: 0, fontWeight: theme.font.weight.semibold,
  },
  retryButton: {
    padding: '8px 16px', fontSize: theme.font.size.caption,
    fontWeight: theme.font.weight.bold, color: '#fff',
    backgroundColor: theme.color.primary, border: 'none',
    borderRadius: theme.radius.sm, cursor: 'pointer', whiteSpace: 'nowrap',
  },

  /* 풀스크린 뷰어 */
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
