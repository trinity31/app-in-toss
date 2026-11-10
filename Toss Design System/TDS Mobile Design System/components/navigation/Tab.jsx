import React from 'react';

/** Underline tab strip. */
export function Tab({ items = [], value = 0, alignment = 'fixed', size = 'L', onChange, style, ...rest }) {
  const fs = size === 'S' ? 15 : 17;
  return (
    <div style={{
      display: 'flex', width: '100%', overflowX: alignment === 'fluid' ? 'auto' : 'visible',
      borderBottom: '1px solid rgba(2,32,71,0.05)', background: 'var(--semantic-background-default)', ...style,
    }} {...rest}>
      {items.map((label, i) => {
        const on = i === value;
        return (
          <button key={i} type="button" onClick={() => onChange && onChange(i)} style={{
            position: 'relative', boxSizing: 'border-box', flex: alignment === 'fixed' ? 1 : '0 0 auto',
            minHeight: 51, padding: 8, border: 0, background: 'none', cursor: 'pointer',
            fontFamily: 'var(--tds-font-body)', fontWeight: on ? 700 : 510, fontSize: fs, lineHeight: 1.252,
            color: on ? 'var(--semantic-text-primary)' : 'var(--semantic-text-quaternary)', whiteSpace: 'nowrap',
          }}>
            {label}
            {on && <span style={{ position: 'absolute', left: 8, right: 8, bottom: -1, height: 2, borderRadius: 10, background: 'var(--base-grey-grey-800)' }} />}
          </button>
        );
      })}
    </div>
  );
}
