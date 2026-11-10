import React from 'react';

/** Grid of small icon+label tiles (2, 3 or 4 columns). */
export function GridList({ items = [], columns = 3, onSelect, style, ...rest }) {
  return (
    <div style={{
      boxSizing: 'border-box', display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8,
      padding: '8px var(--tds-side-padding-m)', background: 'var(--semantic-background-default)', ...style,
    }} {...rest}>
      {items.map((it, i) => (
        <button key={i} type="button" onClick={() => onSelect && onSelect(it, i)} style={{
          boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          minHeight: 74, padding: '12px 8px', border: 0, cursor: 'pointer',
          borderRadius: 9, background: 'rgba(0,23,51,0.02)',
        }}>
          {it.icon && <span style={{ width: 28, height: 28, display: 'inline-flex' }}>{it.icon}</span>}
          <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 14, lineHeight: 1.15, textAlign: 'center', color: 'var(--base-grey-grey-900)' }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
