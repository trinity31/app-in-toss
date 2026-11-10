import React from 'react';

/** Scrolling body region of a Bottom Sheet. */
export function SheetBody({ children, kind = 'list', style, ...rest }) {
  const pad = kind === 'paragraph' ? '4px var(--tds-side-padding-m) 12px' : kind === 'asset' ? '12px 0 20px' : '0';
  return (
    <div style={{
      boxSizing: 'border-box', maxHeight: 420, overflowY: 'auto', padding: pad,
      display: kind === 'asset' ? 'flex' : 'block', justifyContent: 'center',
      fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: 'var(--semantic-text-secondary)',
      ...style,
    }} {...rest}>{children}</div>
  );
}
