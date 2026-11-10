import React from 'react';

/** One bottom-tab-bar entry. */
export function TabBarItem({ label, icon, selected = false, redDot = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{
      position: 'relative', boxSizing: 'border-box', minWidth: 46, height: 43, padding: '1px 6px', border: 0, background: 'none', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, ...style,
    }} {...rest}>
      <span style={{ width: 24, height: 24, display: 'inline-flex', color: selected ? 'var(--semantic-icon-primary)' : 'var(--semantic-icon-quaternary)' }}>{icon}</span>
      <span style={{
        fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 11, lineHeight: '13.2px',
        color: selected ? 'var(--semantic-text-primary)' : 'var(--semantic-text-quaternary)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
      }}>{label}</span>
      {redDot && <span style={{ position: 'absolute', top: 1, right: '50%', marginRight: -14, width: 6, height: 6, borderRadius: '50%', background: 'var(--base-red-red-500)' }} />}
    </button>
  );
}
