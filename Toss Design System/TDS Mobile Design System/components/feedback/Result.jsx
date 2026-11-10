import React from 'react';

/** Full-screen success / failure / empty state. */
export function Result({ asset, title, description, children, style, ...rest }) {
  return (
    <div style={{
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: '48px var(--tds-side-padding-m)', textAlign: 'center', ...style,
    }} {...rest}>
      {asset && <div style={{ width: 88, height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{asset}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: 22, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{title}</div>
        {description && <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: 'var(--semantic-text-secondary)' }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}
