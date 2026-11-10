import React from 'react';

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

/** Numeric keypad — 3×4 grid of 120×63 keys. */
export function Keypad({ onKey, style, ...rest }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: 'var(--semantic-background-default)', ...style }} {...rest}>
      {KEYS.map((k, i) => (
        <button key={i} type="button" disabled={!k} onClick={() => k && onKey && onKey(k)} style={{
          height: 63, border: 0, background: 'transparent', cursor: k ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 30, lineHeight: '40px',
          color: 'var(--base-grey-grey-700)',
        }}>{k}</button>
      ))}
    </div>
  );
}
