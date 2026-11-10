import React from 'react';

const SIZES = { 16:16, 20:20, 24:24, 28:28, 30:30, 36:36, 40:40, 48:48, 56:56, 64:64, 72:72 };
const SHAPE_RADIUS = { circle: '50%', squircle: 0.28, card: 0.22, square: 0 };

/** Icon or image inside an optional shaped background — the TDS "Asset" primitive. */
export function Asset({ children, src, alt = '', size = 40, shape = 'circle', background = true, style, ...rest }) {
  const d = SIZES[size] || size;
  const r = shape === 'circle' ? '50%' : `${Math.round(d * (SHAPE_RADIUS[shape] ?? 0))}px`;
  return (
    <div style={{
      width: d, height: d, borderRadius: r, overflow: 'hidden', flexShrink: 0,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: background ? 'var(--asset-background-default)' : 'transparent',
      color: 'var(--semantic-icon-secondary)', ...style,
    }} {...rest}>
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : children}
    </div>
  );
}
