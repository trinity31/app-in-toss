import React from 'react';

const SIZES = {
  S:  { height: 32, radius: 8,  fontSize: 13, padX: 10 },
  M:  { height: 38, radius: 10, fontSize: 15, padX: 16 },
  L:  { height: 48, radius: 14, fontSize: 17, padX: 16 },
  XL: { height: 56, radius: 16, fontSize: 17, padX: 28 },
};

const COLORS = {
  brand:   { fill: 'var(--semantic-fill-brand)',        on: 'var(--semantic-text-on-fill)',  weakBg: 'var(--semantic-fill-brand-weak)',   weakFg: 'var(--semantic-text-brand)' },
  neutral: { fill: 'var(--semantic-fill-neutral)',      on: 'var(--semantic-text-on-fill)',  weakBg: 'var(--semantic-fill-neutral-weak)', weakFg: 'var(--semantic-text-primary)' },
  danger:  { fill: 'var(--semantic-fill-danger)',       on: 'var(--semantic-text-on-fill)',  weakBg: 'var(--semantic-fill-danger-weak)',  weakFg: 'var(--semantic-text-danger)' },
  inverse: { fill: 'var(--semantic-fill-inverse)',      on: 'var(--semantic-text-brand)',    weakBg: 'var(--semantic-fill-inverse-weak)', weakFg: 'var(--semantic-fill-inverse)' },
};

/** Primary action button. Fill / Weak variants across four sizes. */
export function Button({
  children, size = 'L', color = 'brand', variant = 'fill',
  disabled = false, loading = false, fullWidth = false, onClick, style, ...rest
}) {
  const s = SIZES[size] || SIZES.L;
  const c = COLORS[color] || COLORS.brand;
  const weak = variant === 'weak';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        position: 'relative', boxSizing: 'border-box', border: 0, cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        minHeight: s.height, height: s.height, padding: `2px ${s.padX}px`,
        width: fullWidth ? '100%' : undefined,
        borderRadius: s.radius, overflow: 'hidden',
        background: weak ? c.weakBg : c.fill,
        color: weak ? c.weakFg : c.on,
        fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: s.fontSize, lineHeight: 1.252,
        opacity: disabled ? 0.3 : 1,
        transition: 'filter .15s ease, opacity .15s ease',
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.filter = 'brightness(0.86)'; }}
      onMouseUp={(e) => { e.currentTarget.style.filter = 'none'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
      {...rest}
    >
      {loading ? <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'tds-spin .7s linear infinite' }} /> : children}
      <style>{'@keyframes tds-spin{to{transform:rotate(360deg)}}'}</style>
    </button>
  );
}
