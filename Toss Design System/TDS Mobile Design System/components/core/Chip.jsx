import React from 'react';

const SIZES = { S: { h: 32, fs: 13, px: 12 }, M: { h: 38, fs: 15, px: 14 } };

/** Filter / selection chip. Pill or Square, Fill or Weak, with optional red dot. */
export function Chip({
  children, size = 'M', shape = 'pill', variant = 'fill', selected = false,
  leading, tailing, redDot = false, onClick, style, ...rest
}) {
  const s = SIZES[size] || SIZES.M;
  const radius = shape === 'pill' ? 999 : 12;
  const bg = selected
    ? (variant === 'weak' ? 'var(--semantic-fill-brand-weak)' : 'var(--semantic-fill-neutral)')
    : 'var(--semantic-fill-neutral-weak)';
  const fg = selected
    ? (variant === 'weak' ? 'var(--semantic-text-brand)' : 'var(--semantic-text-on-fill)')
    : 'var(--semantic-text-secondary)';
  return (
    <span style={{ position: 'relative', display: 'inline-flex', ...style }} {...rest}>
      <button type="button" onClick={onClick} style={{
        boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        minHeight: s.h, height: s.h, minWidth: 64, padding: `2px ${s.px}px`, border: 0, cursor: 'pointer',
        borderRadius: radius, overflow: 'hidden', background: bg, color: fg,
        boxShadow: selected ? 'none' : 'inset 0 0 0 0.66px rgba(0,23,51,0.02)',
        fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: s.fs, lineHeight: 1.252, whiteSpace: 'nowrap',
      }}>
        {leading && <span style={{ display: 'inline-flex', width: 18, height: 18 }}>{leading}</span>}
        {children}
        {tailing && <span style={{ display: 'inline-flex', width: 16, height: 16 }}>{tailing}</span>}
      </button>
      {redDot && <span style={{ position: 'absolute', right: 1, top: 2, width: 8, height: 8, borderRadius: '50%', background: 'var(--base-red-red-500)', boxShadow: 'inset 0 0 0 1.5px var(--semantic-background-default)' }} />}
    </span>
  );
}
