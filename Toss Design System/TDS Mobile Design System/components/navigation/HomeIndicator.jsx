import React from 'react';

/** iOS home indicator bar. */
export function HomeIndicator({ theme = 'light', style, ...rest }) {
  return (
    <div style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, ...style }} {...rest}>
      <div style={{ width: 134, height: 5, borderRadius: 100, background: theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,12,30,0.8)' }} />
    </div>
  );
}
