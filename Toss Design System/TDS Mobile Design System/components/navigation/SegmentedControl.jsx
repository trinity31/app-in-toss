import React from 'react';

/** Grey track with a white elevated selected pill. */
export function SegmentedControl({ items = [], value = 0, size = 'L', onChange, style, ...rest }) {
  const h = size === 'S' ? 40 : 48;
  const inner = size === 'S' ? 34 : 40;
  return (
    <div style={{ boxSizing: 'border-box', padding: '0 var(--tds-side-padding-m)', ...style }} {...rest}>
      <div style={{
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', height: h, padding: '4px 5px',
        borderRadius: 14, background: 'var(--semantic-fill-neutral-weak)',
      }}>
        {items.map((label, i) => {
          const on = i === value;
          return (
            <button key={i} type="button" onClick={() => onChange && onChange(i)} style={{
              boxSizing: 'border-box', flex: 1, minHeight: inner, height: inner, padding: 8, border: 0, cursor: 'pointer',
              borderRadius: 10, background: on ? 'var(--semantic-background-floated)' : 'transparent',
              boxShadow: on ? 'var(--tds-shadow-tiny)' : 'none',
              fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: size === 'S' ? 15 : 17, lineHeight: 1.252,
              color: on ? 'var(--semantic-text-primary)' : 'var(--semantic-text-quaternary)',
              transition: 'background .15s ease',
            }}>{label}</button>
          );
        })}
      </div>
    </div>
  );
}
