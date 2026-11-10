import React from 'react';

/** One row of a floating Menu. */
export function MenuItem({ children, icon, selected = false, danger = false, pressed = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{
      boxSizing: 'border-box', width: '100%', height: 44, border: 0, borderRadius: 12, cursor: 'pointer', textAlign: 'left',
      background: pressed || selected ? 'var(--semantic-fill-neutral-weak)' : 'transparent',
      display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
      fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.252,
      color: danger ? 'var(--semantic-text-danger)' : 'var(--semantic-text-primary)', ...style,
    }} {...rest}>
      {icon && <span style={{ width: 24, height: 24, display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{children}</span>
      {selected && (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--semantic-icon-brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M 5 12.4 L 10 17.2 L 19 7.2" /></svg>
      )}
    </button>
  );
}
