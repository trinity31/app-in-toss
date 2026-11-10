import React from 'react';

const COLORS = {
  blue: 'var(--base-blue-blue-500)', green: 'var(--base-green-green-500)', red: 'var(--base-red-red-500)',
  yellow: 'var(--base-yellow-yellow-500)', orange: 'var(--base-orange-orange-500)', grey: 'var(--base-grey-grey-300)',
  white: 'rgb(255,255,255)',
};

/** Rounded vertical bar chart, 1–12 bars, one optional highlighted bar. */
export function BarChart({ values = [], color = 'blue', highlight = null, height = 120, labels, style, ...rest }) {
  const max = Math.max(100, ...values);
  return (
    <div style={{ boxSizing: 'border-box', padding: '0 var(--tds-side-padding-m)', ...style }} {...rest}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
        {values.map((v, i) => {
          const on = highlight === null || highlight === i;
          return (
            <div key={i} style={{
              flex: 1, height: `${Math.max(4, (v / max) * 100)}%`, borderRadius: 6,
              background: on ? (COLORS[color] || COLORS.blue) : 'var(--base-grey-grey-200)',
              transition: 'height .3s cubic-bezier(.25,.1,.25,1)',
            }} />
          );
        })}
      </div>
      {labels && (
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {labels.map((l, i) => (
            <span key={i} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--tds-font-body)', fontSize: 12, lineHeight: 1.35, color: 'var(--semantic-text-tertiary)' }}>{l}</span>
          ))}
        </div>
      )}
    </div>
  );
}
