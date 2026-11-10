import React from 'react';

/** Horizontal step indicator, 3–5 steps. */
export function ProgressStepper({ steps = 3, current = 0, labels, style, ...rest }) {
  return (
    <div style={{ boxSizing: 'border-box', padding: '12px var(--tds-side-padding-m)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {Array.from({ length: steps }).map((_, i) => {
          const done = i <= current;
          return (
            <React.Fragment key={i}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--semantic-fill-brand)' : 'var(--base-grey-grey-200)',
                color: done ? '#fff' : 'var(--semantic-text-quaternary)',
                fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 13,
              }}>{i + 1}</div>
              {i < steps - 1 && <div style={{ flex: 1, height: 2, background: i < current ? 'var(--semantic-fill-brand)' : 'var(--base-grey-grey-200)' }} />}
            </React.Fragment>
          );
        })}
      </div>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {labels.map((l, i) => (
            <span key={i} style={{ fontFamily: 'var(--tds-font-body)', fontSize: 12, lineHeight: 1.35, color: i <= current ? 'var(--semantic-text-primary)' : 'var(--semantic-text-quaternary)' }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
