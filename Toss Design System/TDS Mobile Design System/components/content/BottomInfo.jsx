import React from 'react';

/** Grey legal / disclosure block at the bottom of a screen. */
export function BottomInfo({ items = [], size = 'M', gradient = true, style, ...rest }) {
  const fs = size === 'L' ? 15 : 13;
  return (
    <div style={{ ...style }} {...rest}>
      <div style={{ boxSizing: 'border-box', padding: '24px 0', background: 'var(--semantic-background-lower)' }}>
        {items.map((it, i) => (
          <div key={i} style={{ boxSizing: 'border-box', display: 'flex', gap: 8, padding: '0 var(--tds-side-padding-m) 8px' }}>
            <span style={{ width: 16, textAlign: 'center', flexShrink: 0, fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: fs, lineHeight: '19.5px', color: 'var(--semantic-text-secondary)' }}>•</span>
            <span style={{ flex: 1, fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: fs, lineHeight: 1.5, color: 'var(--semantic-text-secondary)', textWrap: 'pretty' }}>{it}</span>
          </div>
        ))}
      </div>
      {gradient && <div style={{ height: 160, background: 'linear-gradient(180deg, var(--semantic-background-lower) 0%, rgba(242,244,246,0) 100%)' }} />}
    </div>
  );
}
