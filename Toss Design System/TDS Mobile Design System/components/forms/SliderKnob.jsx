import React from 'react';

const C = { blue: 'var(--semantic-fill-brand)', red: 'var(--base-red-red-500)', black: 'var(--base-grey-grey-800)' };

/** The 20px draggable handle of a Slider. */
export function SliderKnob({ color = 'blue', size = 20, style, ...rest }) {
  return <div style={{ width: size, height: size, borderRadius: '50%', background: C[color] || C.blue, boxShadow: 'var(--tds-shadow-medium)', ...style }} {...rest} />;
}
