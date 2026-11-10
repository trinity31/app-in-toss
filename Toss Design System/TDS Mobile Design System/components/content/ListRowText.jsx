import React from 'react';

/** The centre text block of a List Row: 1–3 lines, title above or below the description. */
export function ListRowText({ title, description, subText, mainTextPosition = 'top', titleWeight = 590, titleStyle, style, ...rest }) {
  const t = (
    <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: titleWeight, fontSize: titleStyle === 'small' ? 15 : 17, lineHeight: 1.35, color: 'var(--semantic-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
  );
  const d = description && (
    <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.5, color: 'var(--semantic-text-tertiary)' }}>{description}</div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, ...style }} {...rest}>
      {subText && <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 13, lineHeight: 1.35, color: 'var(--semantic-text-tertiary)' }}>{subText}</div>}
      {mainTextPosition === 'bottom' ? <>{d}{t}</> : <>{t}{d}</>}
    </div>
  );
}
