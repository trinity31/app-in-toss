import React from 'react';

const PADDING = { dialog: '0 14px 14px', sheet: '17px 20px 0', cta: '0 20px' };

/** Shared button footer for Dialog, Bottom Sheet and Bottom CTA. */
export function ButtonArea({ children, context = 'sheet', direction = 'horizontal', style, ...rest }) {
  return (
    <div style={{
      boxSizing: 'border-box', display: 'flex', flexDirection: direction === 'vertical' ? 'column' : 'row',
      gap: direction === 'vertical' ? 8 : 8, padding: PADDING[context] || PADDING.sheet, ...style,
    }} {...rest}>{children}</div>
  );
}
