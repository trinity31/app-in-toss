import React from 'react';

const Chevron = ({ dir = 'right', color = 'var(--semantic-icon-quaternary)' }) => {
  const rot = { right: 'none', down: 'rotate(90deg)', up: 'rotate(-90deg)' }[dir];
  return (
    <span style={{ width: 24, height: 24, position: 'relative', display: 'inline-block', transform: rot, flexShrink: 0 }}>
      <svg width="6.4" height="10.9" viewBox="0 0 6.4 10.9" fill={color} style={{ position: 'absolute', left: 8.8, top: 6.5 }}>
        <path d="M 1 0 C 0.8 0 0.5 0.1 0.4 0.3 C 0 0.7 0 1.2 0.4 1.6 L 4.2 5.4 L 0.3 9.3 C -0.1 9.7 -0.1 10.2 0.3 10.6 C 0.7 11 1.2 11 1.6 10.6 L 6.1 6.1 C 6.5 5.7 6.5 5.2 6.1 4.8 L 1.6 0.3 C 1.4 0.2 1.2 0 1 0 Z" fillRule="evenodd" />
      </svg>
    </span>
  );
};

/** Trailing slot of a list row: value text, chevron, or a supplied control. */
export function RightAccessory({ text, subText, arrow = 'none', align = 'right', children, style, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, ...style }} {...rest}>
      {(text || subText) && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
          {text && <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.35, color: 'var(--semantic-text-secondary)' }}>{text}</span>}
          {subText && <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 13, lineHeight: 1.35, color: 'var(--semantic-text-quaternary)' }}>{subText}</span>}
        </div>
      )}
      {children}
      {arrow !== 'none' && <Chevron dir={arrow} />}
    </div>
  );
}
