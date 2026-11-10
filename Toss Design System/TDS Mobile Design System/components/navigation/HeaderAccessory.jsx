import React from 'react';

/** Tailing accessory of a List Header: text, icon or both. */
export function HeaderAccessory({ text, icon, size = 'M', onClick, style, ...rest }) {
  const fs = size === 'S' ? 13 : 15;
  return (
    <button type="button" onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 2, border: 0, background: 'none', padding: 0,
      cursor: onClick ? 'pointer' : 'default', color: 'var(--semantic-text-tertiary)',
      fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: fs, lineHeight: 1.35, whiteSpace: 'nowrap', ...style,
    }} {...rest}>
      {text}
      {icon || (onClick && (
        <span style={{ width: 18, height: 18, position: 'relative', display: 'inline-block' }}>
          <svg width="5" height="8.5" viewBox="0 0 6.4 10.9" fill="var(--semantic-icon-quaternary)" style={{ position: 'absolute', left: 6.5, top: 4.7 }}>
            <path d="M 1 0 C 0.8 0 0.5 0.1 0.4 0.3 C 0 0.7 0 1.2 0.4 1.6 L 4.2 5.4 L 0.3 9.3 C -0.1 9.7 -0.1 10.2 0.3 10.6 C 0.7 11 1.2 11 1.6 10.6 L 6.1 6.1 C 6.5 5.7 6.5 5.2 6.1 4.8 L 1.6 0.3 C 1.4 0.2 1.2 0 1 0 Z" fillRule="evenodd" />
          </svg>
        </span>
      ))}
    </button>
  );
}
