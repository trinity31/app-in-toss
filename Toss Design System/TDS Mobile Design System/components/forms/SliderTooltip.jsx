import React from 'react';

/** Dark value bubble that tracks a Slider knob. */
export function SliderTooltip({ children, placement = 'top', style, ...rest }) {
  const bubble = (
    <div style={{
      padding: '6px 10px', borderRadius: 10, background: 'var(--base-grey-grey-800)', color: 'rgb(255,255,255)',
      fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 13, lineHeight: 1.35, whiteSpace: 'nowrap',
    }}>{children}</div>
  );
  const tail = (
    <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', [placement === 'top' ? 'borderTop' : 'borderBottom']: '5px solid var(--base-grey-grey-800)' }} />
  );
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', ...style }} {...rest}>
      {placement === 'top' ? <>{bubble}{tail}</> : <>{tail}{bubble}</>}
    </div>
  );
}
