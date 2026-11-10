import React from 'react';

/** 50×30 toggle with a 24px handle. */
export function Switch({ checked = false, disabled = false, onChange, style, ...rest }) {
  return (
    <span
      role="switch" aria-checked={checked} tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange && onChange(!checked)}
      style={{
        position: 'relative', display: 'inline-block', width: 50, height: 30, borderRadius: 1000,
        background: checked ? 'var(--semantic-fill-brand)' : 'var(--base-grey-grey-300)',
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1,
        transition: 'background .18s cubic-bezier(.25,.1,.25,1)', ...style,
      }}
      {...rest}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 23 : 3, width: 24, height: 24, borderRadius: '50%',
        background: 'rgb(255,255,255)', transition: 'left .18s cubic-bezier(.25,.1,.25,1)',
      }} />
    </span>
  );
}
