import React from 'react';

const SIZES = { XS: 14, S: 18, M: 24, L: 30, XL: 36 };

const Star = ({ size, fill }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}>
    <path d="M 12 1.6 L 15.05 8.03 L 21.9 8.95 L 16.9 13.87 L 18.13 20.8 L 12 17.5 L 5.87 20.8 L 7.1 13.87 L 2.1 8.95 L 8.95 8.03 Z" />
  </svg>
);

/** Star rating — read-only display or interactive control. */
export function Rating({ value = 0, size = 'M', kind = 'full', readOnly = true, disabled = false, onChange, style, ...rest }) {
  const d = SIZES[size] || 24;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: disabled ? 0.3 : 1, ...style }} {...rest}>
      <div style={{ display: 'inline-flex' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} onClick={() => !readOnly && !disabled && onChange && onChange(i + 1)} style={{ cursor: readOnly ? 'default' : 'pointer', display: 'inline-flex' }}>
            <Star size={d} fill={i < Math.round(value) ? 'var(--base-yellow-yellow-500)' : 'var(--base-grey-grey-200)'} />
          </span>
        ))}
      </div>
      {kind === 'full' && (
        <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 20, lineHeight: '29px', color: 'var(--semantic-text-primary)' }}>{value}</span>
      )}
    </div>
  );
}
