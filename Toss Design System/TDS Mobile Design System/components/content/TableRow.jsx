import React from 'react';

/** Two-column label/value row for detail tables. */
export function TableRow({ left, right, align = 'space-between', leftRatio = 50, style, ...rest }) {
  return (
    <div style={{ display: 'flex', width: '100%', background: 'var(--semantic-background-default)', ...style }} {...rest}>
      <div style={{ boxSizing: 'border-box', flex: align === 'space-between' ? `0 0 ${leftRatio}%` : '0 0 auto', display: 'flex', alignItems: 'center', padding: '10px 8px 10px var(--tds-side-padding-m)' }}>
        <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: 16, lineHeight: 1.35, color: 'var(--base-grey-grey-900)' }}>{left}</span>
      </div>
      <div style={{ boxSizing: 'border-box', flex: 1, display: 'flex', alignItems: 'center', padding: '10px var(--tds-side-padding-m) 10px 8px' }}>
        <span style={{ flex: 1, textAlign: 'right', fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 16, lineHeight: 1.35, color: 'var(--semantic-text-secondary)' }}>{right}</span>
      </div>
    </div>
  );
}
