import React from 'react';

/** Selectable row inside a Bottom Sheet body. */
export function SelectionRow({ title, description, leftAccessory, selected = false, onClick, style, ...rest }) {
  return (
    <div onClick={onClick} style={{
      boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12, minHeight: 56,
      padding: '12px var(--tds-side-padding-m)', cursor: 'pointer',
      background: selected ? 'var(--semantic-fill-neutral-weak)' : 'transparent', ...style,
    }} {...rest}>
      {leftAccessory && <div style={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{leftAccessory}</div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: selected ? 700 : 590, fontSize: 17, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{title}</div>
        {description && <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.5, color: 'var(--semantic-text-tertiary)' }}>{description}</div>}
      </div>
      {selected && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--semantic-icon-brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M 5 12.4 L 10 17.2 L 19 7.2" /></svg>
      )}
    </div>
  );
}
