import React from 'react';

/** Leading or tailing slot inside a Chip: icon, profile disc, chevron or close X. */
export function ChipAccessory({ kind = 'icon', side = 'leading', size = 'M', children, src, style, ...rest }) {
  const d = side === 'leading' ? (size === 'S' ? 16 : 18) : (size === 'S' ? 14 : 16);
  const color = 'var(--semantic-icon-tertiary)';
  const base = { width: d, height: d, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color, ...style };
  if (kind === 'profile') return <span style={{ ...base, borderRadius: '50%', overflow: 'hidden', background: 'var(--asset-background-default)' }} {...rest}>{src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : children}</span>;
  if (kind === 'downChevron') return (
    <span style={base} {...rest}><svg width={d} height={d} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M 4 6.2 L 8 10.2 L 12 6.2" /></svg></span>
  );
  if (kind === 'close') return (
    <span style={base} {...rest}><svg width={d} height={d} viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"><line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" /></svg></span>
  );
  return <span style={base} {...rest}>{children}</span>;
}
