import React from 'react';

/** Text field with a masked value and a show/hide toggle. */
export function PasswordField({ label, value = '', placeholder = '', helpText, error = false, disabled = false, variant = 'line', onChange, style, ...rest }) {
  const [show, setShow] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const borderColor = error ? 'var(--semantic-fill-danger)' : focused ? 'var(--semantic-fill-brand)' : 'rgba(0,27,55,0.1)';
  const box = variant === 'box';
  return (
    <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 0', opacity: disabled ? 0.3 : 1, ...style }} {...rest}>
      {label && <div style={{ padding: '0 var(--tds-side-padding-m)', fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 13, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{label}</div>}
      <div style={{ padding: '0 var(--tds-side-padding-m)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, boxSizing: 'border-box',
          minHeight: box ? 52 : 34, padding: box ? '0 16px' : '0 0 4px 0',
          borderRadius: box ? 'var(--tds-radius-m)' : 0,
          background: box ? 'var(--semantic-background-lower)' : 'transparent',
          border: box ? 'none' : `2px solid ${borderColor}`,
        }}>
          <input
            type={show ? 'text' : 'password'} value={value} placeholder={placeholder} disabled={disabled}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={(e) => onChange && onChange(e.target.value)}
            style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.252, color: 'var(--semantic-text-primary)' }}
          />
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? '숨기기' : '보기'} style={{ width: 24, height: 24, border: 0, background: 'none', cursor: 'pointer', color: 'var(--semantic-icon-quaternary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 2 12 C 4.5 7 8 5 12 5 C 16 5 19.5 7 22 12 C 19.5 17 16 19 12 19 C 8 19 4.5 17 2 12 Z" />
              <circle cx="12" cy="12" r="3" />
              {!show && <line x1="4" y1="20" x2="20" y2="4" />}
            </svg>
          </button>
        </div>
      </div>
      {helpText && <div style={{ padding: '0 var(--tds-side-padding-m)', fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: error ? 'var(--semantic-text-danger)' : 'var(--semantic-text-tertiary)' }}>{helpText}</div>}
    </div>
  );
}
