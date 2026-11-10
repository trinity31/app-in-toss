import React from 'react';

/** Floating blurred capsule confirming a completed action. */
export function Toast({ children, leading, action, onAction, position = 'bottom', style, ...rest }) {
  return (
    <div style={{
      boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', gap: 12,
      minHeight: 59, padding: '14px 15px 14px 16px', borderRadius: 9999,
      background: 'rgba(3,24,50,0.46)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
      ...style,
    }} {...rest}>
      {leading && <span style={{ width: 24, height: 24, flexShrink: 0, display: 'inline-flex', color: 'rgba(253,253,254,0.89)' }}>{leading}</span>}
      <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 15, lineHeight: 1.35, color: 'rgba(253,253,254,0.89)', whiteSpace: 'nowrap' }}>{children}</span>
      {action && (
        <button type="button" onClick={onAction} style={{
          boxSizing: 'border-box', minHeight: 31, padding: '2px 12px', border: 0, borderRadius: 100, cursor: 'pointer',
          background: 'rgba(0,25,54,0.31)', color: 'rgba(253,253,254,0.89)',
          fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 13, lineHeight: 1.15, whiteSpace: 'nowrap',
        }}>{action}</button>
      )}
    </div>
  );
}
