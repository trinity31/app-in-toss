import { useState, useEffect } from 'react';
import { Asset } from '@toss/tds-mobile';
import { theme, primaryButton, secondaryButton } from '../styles/theme';
import { API_ENDPOINTS } from '../config/api';

// 연하장 타입 제외한 기본 프로필 타입 (API 실패 시 fallback)
const FALLBACK_TYPES = [
  { id: 'sns',          title: 'SNS 프로필',      description: '밝고 친근한 느낌',         icon: 'u1F4F1.png' },
  { id: 'professional', title: '전문가 프로필',    description: '취업·비즈니스용',           icon: 'u1F4BC.png' },
  { id: 'artist',       title: '아티스트 프로필',  description: '창의적이고 개성있는',       icon: 'u1F3A8.png' },
  { id: 'dating',       title: '소개팅 프로필',    description: '매력적이고 따뜻한',         icon: 'u1F496.png' },
  { id: 'nomad',        title: '디지털 노마드',    description: '자유롭고 모던한',           icon: 'u2708.png' },
  { id: 'creative',     title: '크리에이티브',     description: '나를 다른 세계로 변신!',     icon: 'u2728.png' },
];

/**
 * TypeSelection — 프로필 타입 선택 화면
 *
 * props.selectedImage: Blob (미리보기용)
 * props.onSelect: (profileTypeId) => void
 * props.onBack: () => void
 */
export default function TypeSelection({ selectedImage, onSelect, onBack }) {
  const [types, setTypes] = useState(FALLBACK_TYPES);
  const [selectedId, setSelectedId] = useState(null);

  // 프로필 타입 목록 fetch
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(API_ENDPOINTS.GET_PROFILE_TYPES, {
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.profileTypes) {
          // 연하장, 의사, 위키드 타입 제외
          const excluded = ['doctor', 'wicked'];
          const filtered = data.profileTypes.filter(
            (t) => !t.id.startsWith('new-year-card') && !excluded.includes(t.id)
          );
          if (filtered.length) setTypes(filtered);
        }
      } catch {
        // fallback 유지
      }
    })();

    return () => controller.abort();
  }, []);

  const imagePreviewUrl = selectedImage
    ? URL.createObjectURL(selectedImage)
    : null;

  return (
    <div style={styles.container}>
      {/* 사진 미리보기 + 헤더 */}
      <div style={styles.topSection}>
        {imagePreviewUrl && (
          <div style={styles.previewWrap}>
            <img src={imagePreviewUrl} alt="" style={styles.previewImage} />
          </div>
        )}
        <h1 style={styles.title}>어떤 프로필을 만들까요?</h1>
        <p style={styles.subtitle}>원하는 유형을 선택하세요</p>
      </div>

      {/* 타입 목록 */}
      <div style={styles.list}>
        {types.map((type, i) => {
          const isSelected = selectedId === type.id;
          return (
            <button
              key={type.id}
              style={{
                ...styles.card,
                ...(isSelected ? styles.cardSelected : {}),
                animationDelay: `${i * 60}ms`,
              }}
              onClick={() => setSelectedId(type.id)}
            >
              <div style={{
                ...styles.iconWrap,
                backgroundColor: isSelected
                  ? theme.color.primaryLight
                  : theme.color.bgSecondary,
              }}>
                <Asset.Image
                  frameShape={Asset.frameShape.CleanW24}
                  backgroundColor="transparent"
                  src={`https://static.toss.im/2d-emojis/png/4x/${type.icon}`}
                  aria-hidden={true}
                  style={{ aspectRatio: '1/1', width: '28px', height: '28px' }}
                />
              </div>
              <div style={styles.cardText}>
                <span style={{
                  ...styles.cardTitle,
                  color: isSelected ? theme.color.primary : theme.color.textPrimary,
                }}>
                  {type.title}
                </span>
                <span style={styles.cardDesc}>{type.description}</span>
              </div>
              {isSelected && (
                <div style={styles.checkCircle}>
                  <span style={styles.checkMark}>✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 하단 버튼 */}
      <div style={styles.bottomArea}>
        <button
          style={{
            ...styles.confirmBtn,
            opacity: selectedId ? 1 : 0.4,
          }}
          onClick={() => selectedId && onSelect(selectedId)}
          disabled={!selectedId}
        >
          이 유형으로 만들기
        </button>
        <button style={styles.backBtn} onClick={onBack}>
          사진 다시 선택
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
    paddingBottom: '150px',
    backgroundColor: theme.color.bg,
    boxSizing: 'border-box',
  },

  /* ── 상단 ── */
  topSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: '12px',
    marginBottom: '24px',
    animation: 'fadeIn 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  previewWrap: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    marginBottom: '16px',
    border: `3px solid ${theme.color.primaryLight}`,
    boxShadow: theme.shadow.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
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
    margin: '6px 0 0 0',
  },

  /* ── 타입 리스트 ── */
  list: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    width: '100%',
    padding: '14px 16px',
    backgroundColor: theme.color.surface,
    border: `1.5px solid ${theme.color.border}`,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    textAlign: 'left',
    transition: `border-color ${theme.motion.fast} ease, background-color ${theme.motion.fast} ease`,
    animation: 'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  cardSelected: {
    borderColor: theme.color.primary,
    backgroundColor: theme.color.primaryLight,
  },
  iconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `background-color ${theme.motion.fast} ease`,
  },
  cardText: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  cardTitle: {
    fontSize: theme.font.size.body,
    fontWeight: theme.font.weight.semibold,
    letterSpacing: '-0.2px',
    transition: `color ${theme.motion.fast} ease`,
  },
  cardDesc: {
    fontSize: theme.font.size.small,
    color: theme.color.textTertiary,
    fontWeight: theme.font.weight.regular,
  },
  checkCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: theme.color.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    animation: 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
  },
  checkMark: {
    color: theme.color.textOnPrimary,
    fontSize: '12px',
    fontWeight: theme.font.weight.bold,
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
  confirmBtn: {
    ...primaryButton,
    width: '100%',
    maxWidth: '400px',
    padding: '16px',
    transition: `opacity ${theme.motion.fast} ease`,
  },
  backBtn: {
    ...secondaryButton,
    width: '100%',
    maxWidth: '400px',
    padding: '12px',
    backgroundColor: 'transparent',
    color: theme.color.textTertiary,
    fontSize: theme.font.size.caption,
  },
};
