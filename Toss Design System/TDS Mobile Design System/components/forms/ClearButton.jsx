import React from 'react';

/** Circular ✕ that clears a field's value. */
export function ClearButton({ size = 20, onClick, style, ...rest }) {
  return (
    <button type="button" onClick={onClick} aria-label="지우기" style={{
      width: size, height: size, padding: 0, border: 0, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
      background: 'var(--semantic-icon-quaternary)', color: 'var(--semantic-background-default)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style,
    }} {...rest}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="2" y1="2" x2="8" y2="8" /><line x1="8" y1="2" x2="2" y2="8" /></svg>
    </button>
  );
}
