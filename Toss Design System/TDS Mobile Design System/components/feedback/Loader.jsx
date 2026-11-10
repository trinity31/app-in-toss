import React from 'react';

const SIZES = { S: 28, M: 40, L: 56 };
const COLORS = { brand: 'var(--semantic-fill-brand)', neutral: 'var(--semantic-fill-neutral)', inverse: 'var(--semantic-fill-inverse)' };

/** Pulsing disc loader with an optional label underneath. */
export function Loader({ size = 'M', color = 'brand', label, style, ...rest }) {
  const d = SIZES[size] || 40;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 14, ...style }} {...rest}>
      <div style={{ boxSizing: 'border-box', width: d, height: d, padding: 2 }}>
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: COLORS[color] || COLORS.brand, animation: 'tds-pulse 1s cubic-bezier(.45,0,.55,1) infinite' }} />
      </div>
      {label && <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: '22.5px', color: 'var(--semantic-text-primary)', whiteSpace: 'nowrap' }}>{label}</span>}
      <style>{'@keyframes tds-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.62);opacity:.55}}'}</style>
    </div>
  );
}
