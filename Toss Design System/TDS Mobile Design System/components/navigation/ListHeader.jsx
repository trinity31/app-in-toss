import React from 'react';

const TITLE = { XS: 15, S: 17, M: 17, L: 20 };

/** Section header above a list. */
export function ListHeader({ title, subText, subTextPosition = 'upper', accessory, size = 'M', style, ...rest }) {
  const sub = subText && (
    <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 12, lineHeight: 1.35, color: 'var(--semantic-text-tertiary)' }}>{subText}</div>
  );
  return (
    <div style={{
      boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 4,
      padding: '24px var(--tds-side-padding-m) 8px', background: 'var(--semantic-background-default)', ...style,
    }} {...rest}>
      {subTextPosition === 'upper' && sub}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: TITLE[size] || 17, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{title}</span>
        {accessory}
      </div>
      {subTextPosition === 'lower' && sub}
    </div>
  );
}
