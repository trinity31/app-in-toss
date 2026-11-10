import React from 'react';

const SIZES = { XS: 16, S: 20, M: 24, L: 28 };

/** Circle or Line checkmark. TDS has no square checkbox. */
export function Checkbox({ checked = false, variant = 'circle', size = 'M', disabled = false, onChange, style, ...rest }) {
  const d = SIZES[size] || 24;
  const active = 'var(--semantic-fill-brand)';
  const idle = 'var(--semantic-icon-quaternary)';
  return (
    <span
      role="checkbox" aria-checked={checked} tabIndex={disabled ? -1 : 0}
      onClick={() => !disabled && onChange && onChange(!checked)}
      style={{ display: 'inline-flex', width: d, height: d, cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.3 : 1, ...style }}
      {...rest}
    >
      <svg width={d} height={d} viewBox="0 0 24 24">
        {variant === 'circle' && (
          checked
            ? <path fill={active} fillRule="evenodd" d="M 12 0 C 5.37 0 0 5.37 0 12 C 0 18.63 5.37 24 12 24 C 18.63 24 24 18.63 24 12 C 24 5.37 18.63 0 12 0 Z M 17.68 10.05 L 11.59 16.14 C 11.39 16.34 11.11 16.46 10.82 16.46 C 10.53 16.46 10.25 16.34 10.05 16.14 L 6.32 12.41 C 5.89 11.98 5.89 11.29 6.32 10.87 C 6.75 10.44 7.44 10.44 7.86 10.87 L 10.82 13.83 L 16.14 8.51 C 16.57 8.08 17.26 8.08 17.68 8.51 C 18.11 8.94 18.11 9.63 17.68 10.05 Z" />
            : <path fill={idle} fillRule="evenodd" d="M 12 0 C 5.37 0 0 5.37 0 12 C 0 18.63 5.37 24 12 24 C 18.63 24 24 18.63 24 12 C 24 5.37 18.63 0 12 0 Z M 17.68 10.05 L 11.59 16.14 C 11.39 16.34 11.11 16.46 10.82 16.46 C 10.53 16.46 10.25 16.34 10.05 16.14 L 6.32 12.41 C 5.89 11.98 5.89 11.29 6.32 10.87 C 6.75 10.44 7.44 10.44 7.86 10.87 L 10.82 13.83 L 16.14 8.51 C 16.57 8.08 17.26 8.08 17.68 8.51 C 18.11 8.94 18.11 9.63 17.68 10.05 Z" />
        )}
        {variant === 'line' && (
          <path fill="none" stroke={checked ? active : idle} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M 5 12.4 L 10 17.2 L 19 7.2" />
        )}
      </svg>
    </span>
  );
}
