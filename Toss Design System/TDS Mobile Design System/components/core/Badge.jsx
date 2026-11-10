import React from 'react';

const SIZES = {
  XS: { h: 21, r: 9,  fs: 10, fw: 590, py: 3, px: 7, lh: 1.5 },
  S:  { h: 24, r: 11, fs: 12, fw: 700, py: 3, px: 7, lh: '18px' },
  M:  { h: 26, r: 12, fs: 13, fw: 700, py: 3, px: 7, lh: '19.5px' },
  L:  { h: 29, r: 13, fs: 14, fw: 700, py: 4, px: 8, lh: '21px' },
};

const COLORS = {
  blue:   { fill: 'var(--base-blue-blue-500)',   weakBg: 'rgba(49,130,246,0.16)',  weakFg: 'var(--base-blue-blue-600)' },
  red:    { fill: 'var(--base-red-red-500)',     weakBg: 'rgba(240,68,82,0.16)',   weakFg: 'var(--base-red-red-600)' },
  green:  { fill: 'var(--base-green-green-500)', weakBg: 'rgba(2,162,98,0.16)',    weakFg: 'var(--base-green-green-700)' },
  yellow: { fill: 'var(--base-yellow-yellow-500)', weakBg: 'rgba(255,179,49,0.16)', weakFg: 'var(--base-yellow-yellow-900)' },
  teal:   { fill: 'var(--base-teal-teal-500)',   weakBg: 'rgba(0,163,171,0.16)',   weakFg: 'var(--base-teal-teal-700)' },
  grey:   { fill: 'var(--base-grey-grey-600)',   weakBg: 'var(--semantic-fill-neutral-weak)', weakFg: 'var(--semantic-text-tertiary)' },
};

/** Small status/label pill. */
export function Badge({ children, size = 'M', color = 'blue', variant = 'fill', style, ...rest }) {
  const s = SIZES[size] || SIZES.M;
  const c = COLORS[color] || COLORS.blue;
  const weak = variant === 'weak';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
      height: s.h, borderRadius: s.r, padding: `${s.py}px ${s.px}px`, overflow: 'hidden',
      background: weak ? c.weakBg : c.fill, color: weak ? c.weakFg : 'var(--semantic-text-on-fill)',
      fontFamily: 'var(--tds-font-body)', fontWeight: s.fw, fontSize: s.fs, lineHeight: s.lh, whiteSpace: 'nowrap',
      ...style,
    }} {...rest}>{children}</span>
  );
}
