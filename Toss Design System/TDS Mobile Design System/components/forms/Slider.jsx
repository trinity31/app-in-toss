import React from 'react';

const TRACK = { blue: 'var(--semantic-fill-brand)', red: 'var(--base-red-red-500)', black: 'var(--base-grey-grey-800)' };

/** Continuous value slider with a 20px shadowed knob. */
export function Slider({ value = 40, min = 0, max = 100, color = 'blue', labels, tooltip = false, onChange, style, ...rest }) {
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const fill = TRACK[color] || TRACK.blue;
  const ref = React.useRef(null);
  const set = (clientX) => {
    const el = ref.current; if (!el || !onChange) return;
    const r = el.getBoundingClientRect();
    onChange(Math.round(min + ((clientX - r.left) / r.width) * (max - min)));
  };
  return (
    <div style={{ boxSizing: 'border-box', padding: '10px var(--tds-side-padding-m)', ...style }} {...rest}>
      {tooltip && (
        <div style={{ position: 'relative', height: 34, marginBottom: 4 }}>
          <div style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)', padding: '6px 10px', borderRadius: 10, background: 'var(--base-grey-grey-800)', color: '#fff', fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 13, whiteSpace: 'nowrap' }}>{value}</div>
        </div>
      )}
      <div
        ref={ref}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); set(e.clientX); }}
        onPointerMove={(e) => { if (e.buttons) set(e.clientX); }}
        style={{ position: 'relative', height: 5, borderRadius: 2.5, background: 'var(--base-grey-grey-200)', cursor: 'pointer' }}
      >
        <div style={{ position: 'absolute', left: 0, top: 0, height: 5, width: `${pct}%`, minWidth: 20, borderRadius: 2.5, background: fill }} />
        <div style={{ position: 'absolute', left: `${pct}%`, top: -8, width: 20, height: 20, marginLeft: -10, borderRadius: '50%', background: fill, boxShadow: 'var(--tds-shadow-medium)' }} />
      </div>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontFamily: 'var(--tds-font-body)', fontSize: 13, color: 'var(--semantic-text-tertiary)' }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  );
}
