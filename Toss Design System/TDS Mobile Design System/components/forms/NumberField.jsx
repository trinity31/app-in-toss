import React from 'react';

/** White elevated value field — the centre of the Numeric Spinner. */
export function NumberField({ value = 0, size = 'M', style, ...rest }) {
  const fs = { XS: 13, S: 15, M: 17, L: 20 }[size] || 17;
  const r = { XS: 10, S: 12, M: 14, L: 16 }[size] || 14;
  return (
    <div style={{
      boxSizing: 'border-box', minWidth: 49, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 2px', borderRadius: r, background: 'var(--semantic-background-default)', boxShadow: 'var(--tds-shadow-weak)',
      fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: fs, color: 'var(--base-grey-grey-800)', ...style,
    }} {...rest}>{value}</div>
  );
}
