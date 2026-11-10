import React from 'react';
import { GridListItem } from './GridListItem.jsx';

/** Bank / securities-firm selection grid. */
export function BankPicker({ items = [], columns = 3, value, onSelect, style, ...rest }) {
  return (
    <div style={{
      boxSizing: 'border-box', display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8,
      padding: '8px var(--tds-side-padding-m)', ...style,
    }} {...rest}>
      {items.map((it, i) => (
        <GridListItem key={i} label={it.label} icon={it.icon} onClick={() => onSelect && onSelect(it, i)}
          style={value === it.label ? { background: 'var(--semantic-fill-brand-weak)', boxShadow: 'inset 0 0 0 1.5px var(--semantic-fill-brand)' } : undefined} />
      ))}
    </div>
  );
}
