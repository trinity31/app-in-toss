import React from 'react';

/** "더보기" row closing a truncated list. */
export function ListFooter({ children = '더보기', color = 'grey', icon = 'expand', onClick, style, ...rest }) {
  const fg = color === 'blue' ? 'var(--semantic-text-brand)' : 'var(--semantic-text-tertiary)';
  const rot = icon === 'collapse' ? 'rotate(-90deg)' : icon === 'expand' ? 'rotate(90deg)' : 'none';
  return (
    <button type="button" onClick={onClick} style={{
      boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
      width: '100%', minHeight: 60, height: 60, padding: '2px var(--tds-side-padding-m)', border: 0, cursor: 'pointer',
      background: 'var(--semantic-background-default)', ...style,
    }} {...rest}>
      <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.252, color: fg, whiteSpace: 'nowrap' }}>{children}</span>
      {icon !== 'none' && (
        <span style={{ width: 24, height: 24, position: 'relative', display: 'inline-block', transform: rot }}>
          <svg width="6.4" height="10.9" viewBox="0 0 6.4 10.9" fill="var(--semantic-icon-quaternary)" style={{ position: 'absolute', left: 8.8, top: 6.5 }}>
            <path d="M 1 0 C 0.8 0 0.5 0.1 0.4 0.3 C 0 0.7 0 1.2 0.4 1.6 L 4.2 5.4 L 0.3 9.3 C -0.1 9.7 -0.1 10.2 0.3 10.6 C 0.7 11 1.2 11 1.6 10.6 L 6.1 6.1 C 6.5 5.7 6.5 5.2 6.1 4.8 L 1.6 0.3 C 1.4 0.2 1.2 0 1 0 Z" fillRule="evenodd" />
          </svg>
        </span>
      )}
    </button>
  );
}
