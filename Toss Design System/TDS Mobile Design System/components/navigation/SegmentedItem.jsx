import React from 'react';

/** One segment of a Segmented Control. */
export function SegmentedItem({ children, selected = false, size = 'M', onClick, style, ...rest }) {
  const h = size === 'S' ? 34 : 40;
  return (
    <button type="button" onClick={onClick} style={{
      boxSizing: 'border-box', flex: 1, minHeight: h, height: h, padding: 8, border: 0, cursor: 'pointer', borderRadius: 10,
      background: selected ? 'var(--semantic-background-floated)' : 'transparent',
      boxShadow: selected ? 'var(--tds-shadow-tiny)' : 'none',
      fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: size === 'S' ? 15 : 17, lineHeight: 1.252,
      color: selected ? 'var(--semantic-text-primary)' : 'var(--semantic-text-quaternary)',
      transition: 'background .15s ease', ...style,
    }} {...rest}>{children}</button>
  );
}
