import React from 'react';

/** A single tile of a Grid List. */
export function GridListItem({ label, icon, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      minHeight: 74, padding: '12px 8px', border: 0, cursor: 'pointer', borderRadius: 9, background: 'rgba(0,23,51,0.02)', ...style,
    }} {...rest}>
      {icon && <span style={{ width: 28, height: 28, display: 'inline-flex' }}>{icon}</span>}
      <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 14, lineHeight: 1.15, textAlign: 'center', color: 'var(--base-grey-grey-900)' }}>{label}</span>
    </button>
  );
}
