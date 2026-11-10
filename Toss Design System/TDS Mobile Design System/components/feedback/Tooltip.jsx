import React from 'react';

const SIZES = { S: { fs: 13, py: 10, px: 14, r: 14 }, M: { fs: 15, py: 12, px: 16, r: 16 }, L: { fs: 17, py: 14, px: 18, r: 18 } };

const Tail = ({ flip }) => (
  <svg width="38.418" height="11.438" viewBox="0 0 38.418 11.438" fill="var(--semantic-background-floated)" style={{ display: 'block', transform: flip ? 'rotate(180deg)' : 'none' }}>
    <path d="M 30.922 2.63 L 20.459 11 C 19.729 11.584 18.69 11.584 17.96 11 L 7.496 2.63 C 5.368 0.928 2.725 0 0 0 L 38.418 0 C 35.693 0 33.05 0.928 30.922 2.63 Z" fillRule="nonzero" />
  </svg>
);

/** Pointed coach-mark bubble. */
export function Tooltip({ children, size = 'M', placement = 'bottom', align = 'center', style, ...rest }) {
  const s = SIZES[size] || SIZES.M;
  const body = (
    <div style={{
      boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: `${s.py}px ${s.px}px`, borderRadius: s.r, background: 'var(--semantic-background-floated)',
      boxShadow: 'var(--tds-shadow-floating)',
      fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: s.fs, lineHeight: 1.5,
      color: 'var(--semantic-text-primary)', maxWidth: 247, textAlign: align,
    }}>{children}</div>
  );
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', ...style }} {...rest}>
      {placement === 'top' && <><Tail flip />{body}</>}
      {placement === 'bottom' && <>{body}<Tail /></>}
    </div>
  );
}
