import React from 'react';

/** Bottom-anchored sheet with grab handle, title and button area. */
export function BottomSheet({ title, subTitle, children, primaryLabel, secondaryLabel, onPrimary, onSecondary, dim = true, style, ...rest }) {
  return (
    <div style={{ boxSizing: 'border-box', position: 'relative', width: 375, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: 10, ...style }} {...rest}>
      {dim && <div style={{ position: 'absolute', inset: 0, background: 'var(--semantic-background-dim)' }} />}
      <div style={{ position: 'relative', alignSelf: 'stretch', boxSizing: 'border-box', paddingBottom: 20, borderRadius: 28, background: 'var(--semantic-background-floated)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: 20, padding: '16px 10px' }}>
          <div style={{ width: 48, height: 4, borderRadius: 40, background: 'var(--base-grey-grey-200)' }} />
        </div>
        {title && <div style={{ padding: '12px 24px 4px', fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: 20, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{title}</div>}
        {subTitle && <div style={{ padding: '0 24px 8px', fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: 'var(--semantic-text-secondary)' }}>{subTitle}</div>}
        <div>{children}</div>
        {(primaryLabel || secondaryLabel) && (
          <div style={{ display: 'flex', gap: 8, padding: '17px 20px 0' }}>
            {secondaryLabel && <button type="button" onClick={onSecondary} style={sheetBtn('var(--semantic-fill-neutral-weak)', 'var(--semantic-text-secondary)')}>{secondaryLabel}</button>}
            {primaryLabel && <button type="button" onClick={onPrimary} style={sheetBtn('var(--semantic-fill-brand)', 'var(--semantic-text-on-fill)')}>{primaryLabel}</button>}
          </div>
        )}
      </div>
    </div>
  );
}

function sheetBtn(bg, fg) {
  return { flex: 1, minHeight: 56, border: 0, borderRadius: 16, cursor: 'pointer', background: bg, color: fg, fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 17 };
}
