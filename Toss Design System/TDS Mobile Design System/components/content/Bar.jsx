import React from 'react';

const COLORS = {
  blue: 'var(--base-blue-blue-500)', green: 'var(--base-green-green-500)', red: 'var(--base-red-red-500)',
  yellow: 'var(--base-yellow-yellow-500)', orange: 'var(--base-orange-orange-500)', grey: 'var(--base-grey-grey-300)',
  white: 'rgb(255,255,255)',
};

/** A single Bar Chart column. Value snaps to the source's 0–100 in tens. */
export function Bar({ value = 50, color = 'blue', muted = false, width = 16, height = 120, style, ...rest }) {
  return (
    <div style={{ width, height, display: 'flex', alignItems: 'flex-end', ...style }} {...rest}>
      <div style={{
        width: '100%', height: `${Math.max(4, Math.min(100, value))}%`, borderRadius: 6,
        background: muted ? 'var(--base-grey-grey-200)' : (COLORS[color] || COLORS.blue),
        transition: 'height .3s cubic-bezier(.25,.1,.25,1)',
      }} />
    </div>
  );
}
