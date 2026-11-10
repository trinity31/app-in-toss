import React from 'react';

/**
 * Android Apps-in-Toss navigation bar. Structurally the same bar as iOS —
 * service pill, blurred capsules — at 54px with a 48×48 back button.
 */
export function NavigationAndroid({
  title = '서비스 이름', logoSrc, showBack = true, theme = 'light',
  dynamicIcon, onBack, onMore, onClose, style, ...rest
}) {
  const fg = theme === 'dark' ? 'rgb(255,255,255)' : 'rgb(25,31,40)';
  const iconFg = theme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,19,43,0.58)';
  const capsule = {
    display: 'flex', alignItems: 'center', height: 34, borderRadius: 99,
    background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,23,51,0.02)',
    backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 54, width: '100%', ...style }} {...rest}>
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', flex: 1, alignSelf: 'stretch', padding: '0 4px' }}>
        {showBack && (
          <button type="button" onClick={onBack} aria-label="뒤로" style={{ width: 48, height: 48, flexShrink: 0, border: 0, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* icon-arrow-back-android-mono, 24×24 box */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 20 12 L 4 12 M 11 5 L 4 12 L 11 19" />
            </svg>
          </button>
        )}
        <div style={{ ...capsule, background: 'transparent', gap: 6, paddingRight: 10, maxWidth: 168 }}>
          {logoSrc && <img src={logoSrc} alt="" style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0 }} />}
          <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 15, lineHeight: '22.5px', color: fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </div>
      </div>
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 4, paddingRight: 10, flexShrink: 0 }}>
        {dynamicIcon && <div style={{ ...capsule, width: 44, justifyContent: 'center', color: iconFg }}>{dynamicIcon}</div>}
        <div style={{ ...capsule, padding: '0 2px' }}>
          <button type="button" onClick={onMore} aria-label="더보기" style={androidIconBtn(iconFg)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="4" cy="10" r="1.7" /><circle cx="10" cy="10" r="1.7" /><circle cx="16" cy="10" r="1.7" /></svg>
          </button>
          <div style={{ width: 1, height: 16, borderRadius: 1, background: 'rgba(0,27,55,0.1)' }} />
          <button type="button" onClick={onClose} aria-label="닫기" style={androidIconBtn(iconFg)}>
            <svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function androidIconBtn(color) {
  return { width: 44, height: 34, border: 0, background: 'none', cursor: 'pointer', color, display: 'flex', alignItems: 'center', justifyContent: 'center' };
}
