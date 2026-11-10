import React from 'react';

/** Horizontal rule / section divider. */
export function Border({ height = 'default', inset = true, style, ...rest }) {
  const thick = height === 'thick';
  return (
    <div style={{ width: '100%', paddingLeft: inset && !thick ? 'var(--tds-side-padding-m)' : 0, background: thick ? 'var(--semantic-background-lower)' : 'transparent', ...style }} {...rest}>
      <div style={{ height: thick ? 12 : 1, background: thick ? 'var(--semantic-background-lower)' : 'rgba(2,32,71,0.05)' }} />
    </div>
  );
}
