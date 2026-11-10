import React from 'react';

/** One underline tab. */
export function TabItem({ children, selected = false, size = 'L', onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{
      position: 'relative', boxSizing: 'border-box', minHeight: 51, padding: 8, border: 0, background: 'none', cursor: 'pointer',
      fontFamily: 'var(--tds-font-body)', fontWeight: selected ? 700 : 510, fontSize: size === 'S' ? 15 : 17, lineHeight: 1.252,
      color: selected ? 'var(--semantic-text-primary)' : 'var(--semantic-text-quaternary)', whiteSpace: 'nowrap', ...style,
    }} {...rest}>
      {children}
      {selected && <span style={{ position: 'absolute', left: 8, right: 8, bottom: 0, height: 2, borderRadius: 10, background: 'var(--base-grey-grey-800)' }} />}
    </button>
  );
}
