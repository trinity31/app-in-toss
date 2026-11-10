import React from 'react';

const SIZES = { XS: { h: 34, btn: 26, fs: 13, r: 10 }, S: { h: 42, btn: 30, fs: 15, r: 12 }, M: { h: 50, btn: 36, fs: 17, r: 14 }, L: { h: 58, btn: 42, fs: 20, r: 16 } };

/** −/＋ stepper around a numeric field. */
export function NumericSpinner({ value = 0, min = 0, max = 99, size = 'M', disabled = false, onChange, style, ...rest }) {
  const s = SIZES[size] || SIZES.M;
  const step = (d) => !disabled && onChange && onChange(Math.min(max, Math.max(min, value + d)));
  const btn = (label, d, off) => (
    <button type="button" onClick={() => step(d)} disabled={disabled || off} style={{
      width: s.btn, height: s.btn, border: 0, background: 'transparent', cursor: off ? 'default' : 'pointer',
      color: off ? 'var(--semantic-icon-quaternary)' : 'var(--semantic-icon-secondary)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: s.fs, lineHeight: 1,
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="2.5" y1="8" x2="13.5" y2="8" />
        {label === '+' && <line x1="8" y1="2.5" x2="8" y2="13.5" />}
      </svg>
    </button>
  );
  return (
    <div style={{
      boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: s.h, padding: '5px 3px', borderRadius: s.r, background: 'var(--semantic-fill-neutral-weak)',
      opacity: disabled ? 0.3 : 1, ...style,
    }} {...rest}>
      {btn('−', -1, value <= min)}
      <div style={{
        minWidth: 49, alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 2px', borderRadius: s.r, background: 'var(--semantic-background-default)', boxShadow: 'var(--tds-shadow-weak)',
        fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: s.fs, color: 'var(--base-grey-grey-800)',
      }}>{value}</div>
      {btn('+', 1, value >= max)}
    </div>
  );
}
