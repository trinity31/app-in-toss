import React from 'react';

/** Apps-in-Toss navigation bar: back button, service pill, blurred icon capsules. */
export function Navigation({
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
    <div style={{ display: 'flex', alignItems: 'center', height: 44, width: '100%', ...style }} {...rest}>
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', flex: 1, alignSelf: 'stretch', paddingRight: 4 }}>
        {showBack && (
          <button type="button" onClick={onBack} aria-label="뒤로" style={{ width: 44, alignSelf: 'stretch', border: 0, background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="10" height="17" viewBox="0 0 6.4 10.9" fill={fg} style={{ transform: 'scaleX(-1)' }}>
              <path d="M 1 0 C 0.8 0 0.5 0.1 0.4 0.3 C 0 0.7 0 1.2 0.4 1.6 L 4.2 5.4 L 0.3 9.3 C -0.1 9.7 -0.1 10.2 0.3 10.6 C 0.7 11 1.2 11 1.6 10.6 L 6.1 6.1 C 6.5 5.7 6.5 5.2 6.1 4.8 L 1.6 0.3 C 1.4 0.2 1.2 0 1 0 Z" fillRule="evenodd" />
            </svg>
          </button>
        )}
        <div style={{ ...capsule, background: 'transparent', gap: 6, paddingRight: 10, maxWidth: 176 }}>
          {logoSrc && <img src={logoSrc} alt="" style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0 }} />}
          <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 15, lineHeight: '22.5px', color: fg, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
        </div>
      </div>
      <div style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 4, paddingRight: 10, flexShrink: 0 }}>
        {dynamicIcon && <div style={{ ...capsule, width: 44, justifyContent: 'center', color: iconFg }}>{dynamicIcon}</div>}
        <div style={{ ...capsule, padding: '0 2px' }}>
          <button type="button" onClick={onMore} aria-label="더보기" style={navIconBtn(iconFg)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><circle cx="4" cy="10" r="1.7" /><circle cx="10" cy="10" r="1.7" /><circle cx="16" cy="10" r="1.7" /></svg>
          </button>
          <div style={{ width: 1, height: 16, borderRadius: 1, background: 'rgba(0,27,55,0.1)' }} />
          <button type="button" onClick={onClose} aria-label="닫기" style={navIconBtn(iconFg)}>
            <svg width="20" height="20" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function navIconBtn(color) {
  return { width: 44, height: 34, border: 0, background: 'none', cursor: 'pointer', color, display: 'flex', alignItems: 'center', justifyContent: 'center' };
}
