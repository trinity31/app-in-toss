import React from 'react';

const PAD = { S: 8, M: 12, L: 16, XL: 20 };
const MARGIN = { none: 0, S: 16, M: 24 };

/** The workhorse list row: left accessory, title/description, right accessory. */
export function ListRow({
  title, description, subText, leftAccessory, rightAccessory, rightText,
  verticalPadding = 'M', sideMargin = 'M', onClick, style, ...rest
}) {
  const py = PAD[verticalPadding] ?? 12;
  const px = MARGIN[sideMargin] ?? 24;
  return (
    <div
      onClick={onClick}
      style={{
        boxSizing: 'border-box', display: 'flex', alignItems: 'center', minHeight: 44,
        padding: `${py}px ${px}px`, background: 'var(--semantic-background-default)',
        cursor: onClick ? 'pointer' : 'default', overflow: 'hidden', ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        {leftAccessory && <div style={{ width: 30, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{leftAccessory}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
          {subText && <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 13, lineHeight: 1.35, color: 'var(--semantic-text-tertiary)' }}>{subText}</div>}
          <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 17, lineHeight: 1.35, color: 'var(--semantic-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          {description && <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.5, color: 'var(--semantic-text-tertiary)' }}>{description}</div>}
        </div>
      </div>
      {(rightText || rightAccessory) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 12 }}>
          {rightText && <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.35, color: 'var(--semantic-text-secondary)' }}>{rightText}</span>}
          {rightAccessory}
        </div>
      )}
    </div>
  );
}
