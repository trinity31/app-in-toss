import React from 'react';

/** Read-only field that opens a picker — the "Selector" field type. */
export function SelectorField({ label, value, placeholder = '선택해주세요', helpText, error = false, disabled = false, variant = 'line', onClick, style, ...rest }) {
  const box = variant === 'box';
  const empty = !value;
  return (
    <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 6, padding: '16px 0', opacity: disabled ? 0.3 : 1, ...style }} {...rest}>
      {label && <div style={{ padding: '0 var(--tds-side-padding-m)', fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 13, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{label}</div>}
      <div style={{ padding: '0 var(--tds-side-padding-m)' }}>
        <div onClick={() => !disabled && onClick && onClick()} style={{
          display: 'flex', alignItems: 'center', gap: 8, boxSizing: 'border-box', cursor: disabled ? 'default' : 'pointer',
          minHeight: box ? 52 : 34, padding: box ? '0 16px' : '0 0 4px 0',
          borderRadius: box ? 'var(--tds-radius-m)' : 0,
          background: box ? 'var(--semantic-background-lower)' : 'transparent',
          border: box ? 'none' : `2px solid ${error ? 'var(--semantic-fill-danger)' : 'rgba(0,27,55,0.1)'}`,
        }}>
          <span style={{ flex: 1, fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: 1.252, color: empty ? 'var(--semantic-text-quaternary)' : 'var(--semantic-text-primary)' }}>{value || placeholder}</span>
          <span style={{ width: 24, height: 24, position: 'relative', display: 'inline-block', flexShrink: 0, transform: 'rotate(90deg)' }}>
            <svg width="6.4" height="10.9" viewBox="0 0 6.4 10.9" fill="var(--semantic-icon-quaternary)" style={{ position: 'absolute', left: 8.8, top: 6.5 }}>
              <path d="M 1 0 C 0.8 0 0.5 0.1 0.4 0.3 C 0 0.7 0 1.2 0.4 1.6 L 4.2 5.4 L 0.3 9.3 C -0.1 9.7 -0.1 10.2 0.3 10.6 C 0.7 11 1.2 11 1.6 10.6 L 6.1 6.1 C 6.5 5.7 6.5 5.2 6.1 4.8 L 1.6 0.3 C 1.4 0.2 1.2 0 1 0 Z" fillRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>
      {helpText && <div style={{ padding: '0 var(--tds-side-padding-m)', fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: error ? 'var(--semantic-text-danger)' : 'var(--semantic-text-tertiary)' }}>{helpText}</div>}
    </div>
  );
}
