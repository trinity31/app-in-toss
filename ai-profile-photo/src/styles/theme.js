/**
 * AI Profile Photo Studio — Design Tokens
 * 따뜻하고 세련된 팔레트. 4050 여성 타겟.
 */

export const theme = {
  /* ── 색상 ── */
  color: {
    // Primary — 따뜻한 로즈
    primary:      '#C4556A',
    primaryLight: '#FCEEF1',
    primaryDark:  '#9E3A4E',
    primaryGrad:  'linear-gradient(135deg, #C4556A 0%, #D4788A 100%)',

    // Background — 따뜻한 오프화이트
    bg:          '#FDFBFA',
    bgSecondary: '#F8F5F3',
    surface:     '#FFFFFF',

    // Text — 따뜻한 다크
    textPrimary:   '#2D2226',
    textSecondary: '#6B5A60',
    textTertiary:  '#9E8F94',
    textOnPrimary: '#FFFFFF',

    // Accent — 소프트 골드
    accent:      '#C49A6C',
    accentLight: '#F5EDE4',

    // Functional
    border:  '#EDE8E6',
    divider: '#F3EFED',
    error:   '#D94452',
    errorBg: '#FEF2F2',
    success: '#3B9E6F',

    // Overlay
    overlay: 'rgba(45, 34, 38, 0.5)',
  },

  /* ── 타이포그래피 ── */
  font: {
    family: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", Pretendard, sans-serif',
    // 4050 타겟: 가독성 우선, 최소 15px
    size: {
      hero:    '26px',
      title:   '22px',
      heading: '18px',
      body:    '16px',
      caption: '14px',
      small:   '13px',
    },
    weight: {
      bold:     700,
      semibold: 600,
      medium:   500,
      regular:  400,
    },
    lineHeight: {
      tight:  1.3,
      normal: 1.5,
      loose:  1.6,
    },
  },

  /* ── 간격 ── */
  space: {
    xs:  '4px',
    sm:  '8px',
    md:  '12px',
    lg:  '16px',
    xl:  '20px',
    xxl: '28px',
    xxxl:'40px',
  },

  /* ── 모서리 ── */
  radius: {
    sm:   '8px',
    md:   '12px',
    lg:   '16px',
    xl:   '20px',
    full: '9999px',
  },

  /* ── 그림자 ── */
  shadow: {
    sm:   '0 1px 3px rgba(45, 34, 38, 0.06)',
    md:   '0 4px 12px rgba(45, 34, 38, 0.08)',
    lg:   '0 8px 24px rgba(45, 34, 38, 0.12)',
    card: '0 2px 8px rgba(45, 34, 38, 0.06)',
  },

  /* ── 애니메이션 ── */
  motion: {
    fast:    '150ms',
    normal:  '250ms',
    slow:    '400ms',
    reveal:  '600ms',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',  // ease-out-expo
    easeIn:  'cubic-bezier(0.7, 0, 0.84, 0)',
  },
};

/* ── 공통 스타일 헬퍼 ── */
export const buttonBase = {
  border: 'none',
  cursor: 'pointer',
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.semibold,
  fontSize: theme.font.size.body,
  borderRadius: theme.radius.md,
  transition: `opacity ${theme.motion.fast} ease, transform ${theme.motion.fast} ease`,
};

export const primaryButton = {
  ...buttonBase,
  backgroundColor: theme.color.primary,
  color: theme.color.textOnPrimary,
  padding: '16px 24px',
};

export const secondaryButton = {
  ...buttonBase,
  backgroundColor: theme.color.bgSecondary,
  color: theme.color.textPrimary,
  padding: '16px 24px',
};
