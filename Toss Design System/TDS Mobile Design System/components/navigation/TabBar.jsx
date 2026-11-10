import React from 'react';

/** Bottom tab bar. */
export function TabBar({ items = [], value = 0, onChange, style, ...rest }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around', width: '100%', background: 'var(--semantic-background-default)', ...style }} {...rest}>
      {items.map((it, i) => {
        const on = i === value;
        return (
          <button key={i} type="button" onClick={() => onChange && onChange(i)} style={{
            boxSizing: 'border-box', flex: 1, minWidth: 46, height: 43, padding: '1px 6px', border: 0, background: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative',
          }}>
            <span style={{ width: 24, height: 24, display: 'inline-flex', color: on ? 'var(--semantic-icon-primary)' : 'var(--semantic-icon-quaternary)' }}>{it.icon}</span>
            <span style={{
              fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 11, lineHeight: '13.2px',
              color: on ? 'var(--semantic-text-primary)' : 'var(--semantic-text-quaternary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
            }}>{it.label}</span>
            {it.redDot && <span style={{ position: 'absolute', top: 1, right: '50%', marginRight: -14, width: 6, height: 6, borderRadius: '50%', background: 'var(--base-red-red-500)' }} />}
          </button>
        );
      })}
    </div>
  );
}
