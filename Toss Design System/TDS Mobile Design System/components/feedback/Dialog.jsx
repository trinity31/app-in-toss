import React from 'react';

/** Modal alert or confirm. 311px card, radius 24. */
export function Dialog({ title, description, kind = 'confirm', confirmLabel = '확인', cancelLabel = '취소', onConfirm, onCancel, dim = true, style, ...rest }) {
  const card = (
    <div style={{
      boxSizing: 'border-box', width: 311, maxWidth: 320, overflow: 'hidden', borderRadius: 24,
      background: 'var(--semantic-background-floated)', display: 'flex', flexDirection: 'column', alignItems: 'center', ...style,
    }} {...rest}>
      <div style={{ boxSizing: 'border-box', alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: 8, padding: 22 }}>
        <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: 20, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{title}</div>
        {description && <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: 'var(--semantic-text-secondary)' }}>{description}</div>}
      </div>
      <div style={{ boxSizing: 'border-box', alignSelf: 'stretch', display: 'flex', gap: 8, padding: '0 14px 14px' }}>
        {kind === 'confirm' && (
          <button type="button" onClick={onCancel} style={btn('var(--semantic-fill-neutral-weak)', 'var(--semantic-text-secondary)')}>{cancelLabel}</button>
        )}
        <button type="button" onClick={onConfirm} style={btn('var(--semantic-fill-brand)', 'var(--semantic-text-on-fill)')}>{confirmLabel}</button>
      </div>
    </div>
  );
  if (!dim) return card;
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--semantic-background-dim)' }}>{card}</div>
  );
}

function btn(bg, fg) {
  return {
    flex: 1, minHeight: 56, border: 0, borderRadius: 16, cursor: 'pointer', background: bg, color: fg,
    fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 17, lineHeight: 1.252,
  };
}
