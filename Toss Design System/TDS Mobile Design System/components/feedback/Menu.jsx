import React from 'react';

/** Floating action menu — translucent, blurred, hairline-inset card. */
export function Menu({ title, items = [], onSelect, style, ...rest }) {
  return (
    <div style={{
      boxSizing: 'border-box', minWidth: 180, maxWidth: 264, overflow: 'hidden', borderRadius: 20,
      padding: '10px 4px', background: 'rgba(253,253,254,0.89)',
      backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
      boxShadow: 'var(--tds-hairline-inset), var(--tds-shadow-floating)', ...style,
    }} {...rest}>
      {title && (
        <div style={{ boxSizing: 'border-box', padding: '6px 16px 4px', fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 13, lineHeight: '19.5px', color: 'var(--semantic-text-quaternary)' }}>{title}</div>
      )}
      {items.map((it, i) => (
        <button key={i} type="button" onClick={() => onSelect && onSelect(it, i)} style={{
          boxSizing: 'border-box', width: '100%', height: 44, border: 0, borderRadius: 12, cursor: 'pointer',
          background: it.selected ? 'var(--semantic-fill-neutral-weak)' : 'transparent',
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', textAlign: 'left',
          fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.252,
          color: it.danger ? 'var(--semantic-text-danger)' : 'var(--semantic-text-primary)',
        }}>
          {it.icon && <span style={{ width: 24, height: 24, display: 'inline-flex', flexShrink: 0 }}>{it.icon}</span>}
          <span style={{ flex: 1 }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
