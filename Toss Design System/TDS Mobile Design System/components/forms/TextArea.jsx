import React from 'react';

/** Multi-line text input on the box surface. */
export function TextArea({ label, value = '', placeholder = '', helpText, error = false, disabled = false, rows = 4, maxLength, onChange, style, ...rest }) {
  const [focused, setFocused] = React.useState(false);
  const ring = error ? 'var(--semantic-fill-danger)' : focused ? 'var(--semantic-fill-brand)' : 'transparent';
  return (
    <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 0', opacity: disabled ? 0.3 : 1, ...style }} {...rest}>
      {label && <div style={{ padding: '0 var(--tds-side-padding-m)', fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 13, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{label}</div>}
      <div style={{ padding: '0 var(--tds-side-padding-m)' }}>
        <textarea
          rows={rows} value={value} placeholder={placeholder} disabled={disabled} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{
            boxSizing: 'border-box', width: '100%', resize: 'none', border: 0, outline: 'none',
            padding: '14px 16px', borderRadius: 'var(--tds-radius-m)',
            background: 'var(--semantic-background-lower)', boxShadow: `inset 0 0 0 2px ${ring}`,
            fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.5,
            color: 'var(--semantic-text-primary)',
          }}
        />
      </div>
      {(helpText || maxLength) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '0 var(--tds-side-padding-m)', fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: error ? 'var(--semantic-text-danger)' : 'var(--semantic-text-tertiary)' }}>
          <span>{helpText}</span>
          {maxLength && <span>{String(value).length}/{maxLength}</span>}
        </div>
      )}
    </div>
  );
}
