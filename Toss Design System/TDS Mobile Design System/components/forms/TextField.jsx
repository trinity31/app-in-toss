import React from 'react';

/** Labelled text input. Line (2px underline) or Box variant. */
export function TextField({
  label, value = '', placeholder = '', helpText, error = false, disabled = false,
  variant = 'line', type = 'text', suffix, onChange, style, ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = error ? 'var(--semantic-fill-danger)' : focused ? 'var(--semantic-fill-brand)' : 'rgba(0,27,55,0.1)';
  const box = variant === 'box';
  return (
    <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 0', opacity: disabled ? 0.3 : 1, ...style }} {...rest}>
      {label && (
        <div style={{ padding: '0 var(--tds-side-padding-m)', fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 13, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{label}</div>
      )}
      <div style={{ padding: '0 var(--tds-side-padding-m)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, boxSizing: 'border-box',
          minHeight: box ? 52 : 34, padding: box ? '0 16px' : '0 0 4px 0',
          borderRadius: box ? 'var(--tds-radius-m)' : 0,
          background: box ? 'var(--semantic-background-lower)' : 'transparent',
          border: box ? 'none' : `2px solid ${borderColor}`,
          boxShadow: box && focused ? `inset 0 0 0 2px ${borderColor}` : 'none',
        }}>
          <input
            type={type} value={value} placeholder={placeholder} disabled={disabled}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={(e) => onChange && onChange(e.target.value)}
            style={{
              flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent',
              fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.252,
              color: 'var(--semantic-text-primary)',
            }}
          />
          {suffix}
        </div>
      </div>
      {helpText && (
        <div style={{ padding: '0 var(--tds-side-padding-m)', fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: error ? 'var(--semantic-text-danger)' : 'var(--semantic-text-tertiary)' }}>{helpText}</div>
      )}
    </div>
  );
}
