import React from 'react';

/** One key of the numeric Keypad. */
export function KeypadButton({ children, kind = 'num', pressed = false, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} style={{
      boxSizing: 'border-box', width: 120, height: 63, border: 0, cursor: 'pointer',
      background: pressed ? 'var(--semantic-fill-pressed)' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: kind === 'num' ? 30 : 24, lineHeight: '40px',
      color: 'var(--base-grey-grey-700)', ...style,
    }} {...rest}>{children}</button>
  );
}
