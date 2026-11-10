import React from 'react';

/** Static unit or country-code affix inside a field. */
export function FieldPrefix({ children, side = 'suffix', style, ...rest }) {
  return (
    <span style={{
      flexShrink: 0, fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.252,
      color: 'var(--semantic-text-tertiary)', paddingRight: side === 'prefix' ? 4 : 0, paddingLeft: side === 'suffix' ? 4 : 0, ...style,
    }} {...rest}>{children}</span>
  );
}
