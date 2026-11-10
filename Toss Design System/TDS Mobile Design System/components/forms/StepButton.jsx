import React from 'react';

/** The −/＋ button of a Numeric Spinner. */
export function StepButton({ kind = 'plus', size = 'M', disabled = false, onClick, style, ...rest }) {
  const d = { S: 30, M: 36, L: 42 }[size] || 36;
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={kind === 'plus' ? '더하기' : '빼기'} style={{
      width: d, height: d, border: 0, background: 'transparent', cursor: disabled ? 'default' : 'pointer',
      color: disabled ? 'var(--semantic-icon-quaternary)' : 'var(--semantic-icon-secondary)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style,
    }} {...rest}>
      <svg width={d * 0.44} height={d * 0.44} viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="2.5" y1="8" x2="13.5" y2="8" />
        {kind === 'plus' && <line x1="8" y1="2.5" x2="8" y2="13.5" />}
      </svg>
    </button>
  );
}
