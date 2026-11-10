import React from 'react';

/* Source geometry — note TDS names these inversely to the pixel size. */
const SIZES = {
  L: { box: 32, icon: 16, radius: 11, inset: 8 },
  M: { box: 38, icon: 20, radius: 13, inset: 9 },
  S: { box: 48, icon: 24, radius: 16, inset: 12 },
};

/** Square tappable container for a single glyph. */
export function IconButton({ children, size = 'M', variant = 'fill', disabled = false, onClick, style, ...rest }) {
  const s = SIZES[size] || SIZES.M;
  return (
    <button
      type="button" disabled={disabled} onClick={onClick}
      style={{
        position: 'relative', width: s.box, height: s.box, padding: 0, border: 0, overflow: 'hidden',
        borderRadius: s.radius, cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: variant === 'fill' ? 'var(--semantic-fill-neutral-weak)' : 'transparent',
        boxShadow: variant === 'border' ? 'inset 0 0 0 1px rgba(0,27,55,0.1)' : 'none',
        color: 'var(--semantic-icon-secondary)', opacity: disabled ? 0.3 : 1, ...style,
      }}
      {...rest}
    >
      <span style={{ width: s.icon, height: s.icon, display: 'inline-flex' }}>{children}</span>
    </button>
  );
}
