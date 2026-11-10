import React from 'react';

const SIZES = { S: 13, M: 17, L: 20 };

/** Inline text action — Clear, Arrow or Underline appearance. */
export function TextButton({
  children, size = 'M', color = 'brand', appearance = 'clear',
  disabled = false, onClick, style, ...rest
}) {
  const fs = SIZES[size] || SIZES.M;
  const fg = color === 'brand' ? 'var(--semantic-text-brand)' : 'var(--semantic-text-tertiary)';
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 0, border: 0, background: 'none', padding: 0,
        cursor: disabled ? 'default' : 'pointer', color: fg, opacity: disabled ? 0.3 : 1,
        fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: fs, lineHeight: 1.252,
        textDecoration: appearance === 'underline' ? 'underline' : 'none',
        textUnderlineOffset: 2, ...style,
      }}
      {...rest}
    >
      {children}
      {appearance === 'arrow' && (
        <span style={{ position: 'relative', width: 24, height: 24, flexShrink: 0, display: 'inline-block' }}>
          <svg width="6.4" height="10.9" viewBox="0 0 6.4 10.9" fill={color === 'brand' ? 'var(--semantic-fill-brand)' : 'currentColor'} style={{ position: 'absolute', left: 8.8, top: 6.5 }}>
            <path d="M 1 0 C 0.8 0 0.5 0.1 0.4 0.3 C 0 0.7 0 1.2 0.4 1.6 L 4.2 5.4 L 0.3 9.3 C -0.1 9.7 -0.1 10.2 0.3 10.6 C 0.7 11 1.2 11 1.6 10.6 L 6.1 6.1 C 6.5 5.7 6.5 5.2 6.1 4.8 L 1.6 0.3 C 1.4 0.2 1.2 0 1 0 Z" fillRule="evenodd" />
          </svg>
        </span>
      )}
    </button>
  );
}
