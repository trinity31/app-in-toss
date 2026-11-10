import React from 'react';

const SIZES = { XS: 15, S: 17, M: 17, L: 20 };

/** Section title primitive shared by List Header, Bottom Sheet and Top. */
export function Title({ children, size = 'M', variant = 'clear', accessory, onClick, style, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: onClick ? 'pointer' : 'default', ...style }} onClick={onClick} {...rest}>
      <span style={{
        fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: SIZES[size] || 17, lineHeight: 1.35,
        color: 'var(--semantic-text-primary)',
        textDecoration: variant === 'underlined' ? 'underline' : 'none', textUnderlineOffset: 3,
      }}>{children}</span>
      {(variant === 'selector' || accessory) && (accessory || (
        <span style={{ width: 20, height: 20, position: 'relative', display: 'inline-block', transform: 'rotate(90deg)' }}>
          <svg width="6.4" height="10.9" viewBox="0 0 6.4 10.9" fill="var(--semantic-icon-quaternary)" style={{ position: 'absolute', left: 6.8, top: 4.5 }}>
            <path d="M 1 0 C 0.8 0 0.5 0.1 0.4 0.3 C 0 0.7 0 1.2 0.4 1.6 L 4.2 5.4 L 0.3 9.3 C -0.1 9.7 -0.1 10.2 0.3 10.6 C 0.7 11 1.2 11 1.6 10.6 L 6.1 6.1 C 6.5 5.7 6.5 5.2 6.1 4.8 L 1.6 0.3 C 1.4 0.2 1.2 0 1 0 Z" fillRule="evenodd" />
          </svg>
        </span>
      ))}
    </div>
  );
}
