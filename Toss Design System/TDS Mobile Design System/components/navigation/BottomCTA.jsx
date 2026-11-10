import React from 'react';

/** Screen-bottom action area: optional upper item + one or two buttons. */
export function BottomCTA({ children, upperItem, lowerItem, direction = 'horizontal', style, ...rest }) {
  return (
    <div style={{ boxSizing: 'border-box', width: '100%', background: 'var(--semantic-background-default)', ...style }} {...rest}>
      {upperItem && <div style={{ padding: '0 var(--tds-side-padding-cta) 12px' }}>{upperItem}</div>}
      <div style={{
        boxSizing: 'border-box', display: 'flex', flexDirection: direction === 'vertical' ? 'column' : 'row',
        gap: 10, padding: '0 var(--tds-side-padding-cta)',
      }}>{children}</div>
      {lowerItem && <div style={{ padding: '12px var(--tds-side-padding-cta) 0' }}>{lowerItem}</div>}
    </div>
  );
}
