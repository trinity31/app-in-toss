/**
 * AI Pet Studio — Design Tokens
 * 따뜻하고 귀여운 팔레트. 반려동물 키우는 사람 타겟.
 */

export const theme = {
  color: {
    primary:      '#E8834A',
    primaryLight: '#FFF3EC',
    primaryDark:  '#C96A35',
    primaryGrad:  'linear-gradient(135deg, #E8834A 0%, #F0A06E 100%)',

    bg:          '#FFFBF8',
    bgSecondary: '#F8F4F1',
    surface:     '#FFFFFF',

    textPrimary:   '#2D2520',
    textSecondary: '#6B5E56',
    textTertiary:  '#9E9189',
    textOnPrimary: '#FFFFFF',

    accent:      '#7EB5A0',
    accentLight: '#EBF5F0',

    border:  '#EDE8E4',
    divider: '#F3EFEB',
    error:   '#D94452',
    errorBg: '#FEF2F2',
    success: '#3B9E6F',

    overlay: 'rgba(45, 37, 32, 0.5)',
  },

  font: {
    family: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", Pretendard, sans-serif',
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

  space: {
    xs:  '4px',
    sm:  '8px',
    md:  '12px',
    lg:  '16px',
    xl:  '20px',
    xxl: '28px',
    xxxl:'40px',
  },

  radius: {
    sm:   '8px',
    md:   '12px',
    lg:   '16px',
    xl:   '20px',
    full: '9999px',
  },

  shadow: {
    sm:   '0 1px 3px rgba(45, 37, 32, 0.06)',
    md:   '0 4px 12px rgba(45, 37, 32, 0.08)',
    lg:   '0 8px 24px rgba(45, 37, 32, 0.12)',
  },

  motion: {
    fast:    '150ms',
    normal:  '250ms',
    slow:    '400ms',
    reveal:  '600ms',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
};

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
