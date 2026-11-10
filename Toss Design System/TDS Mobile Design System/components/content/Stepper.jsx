import React from 'react';

/** Vertical numbered / icon step list. */
export function Stepper({ steps = [], variant = 'number', theme = 'light', style, ...rest }) {
  return (
    <div style={{ boxSizing: 'border-box', padding: '0 var(--tds-side-padding-m)', ...style }} {...rest}>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <div key={i} style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: theme === 'dark' ? 'var(--base-grey-grey-800)' : 'var(--semantic-fill-neutral-weak)',
                color: theme === 'dark' ? '#fff' : 'var(--semantic-text-tertiary)',
                fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 13,
              }}>{variant === 'number' ? i + 1 : s.icon}</div>
              {!last && <div style={{ flex: 1, width: 2, minHeight: 20, background: 'var(--base-grey-grey-200)', margin: '4px 0' }} />}
            </div>
            <div style={{ paddingBottom: last ? 0 : 16, flex: 1 }}>
              <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 17, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{s.title}</div>
              {s.description && <div style={{ marginTop: 2, fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.5, color: 'var(--semantic-text-tertiary)' }}>{s.description}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
