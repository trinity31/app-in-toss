import React from 'react';

const H = { S: 3, M: 5, L: 8 };
const C = { brand: 'var(--semantic-fill-brand)', neutral: 'var(--semantic-fill-neutral)', success: 'var(--semantic-fill-success)', danger: 'var(--semantic-fill-danger)' };

/** Determinate progress track. */
export function ProgressBar({ value = 0, size = 'M', color = 'brand', style, ...rest }) {
  const h = H[size] || 5;
  return (
    <div style={{ width: '100%', height: h, borderRadius: h / 2, background: 'var(--base-grey-grey-200)', overflow: 'hidden', ...style }} {...rest}>
      <div style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: h, borderRadius: h / 2, background: C[color] || C.brand, transition: 'width .3s cubic-bezier(.25,.1,.25,1)' }} />
    </div>
  );
}
