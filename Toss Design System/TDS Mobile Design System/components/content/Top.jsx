import React from 'react';

/** Page hero: optional resource, subtext-top, title, subtext-bottom, right item, lower CTA. */
export function Top({ title, subTextTop, subTextBottom, resource, rightItem, lowerCTA, style, ...rest }) {
  return (
    <div style={{ boxSizing: 'border-box', padding: '8px var(--tds-side-padding-m) 16px', background: 'var(--semantic-background-default)', ...style }} {...rest}>
      {resource && <div style={{ marginBottom: 12 }}>{resource}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {subTextTop && <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 13, lineHeight: '19.5px', color: 'var(--base-grey-grey-700)' }}>{subTextTop}</div>}
          <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: 24, lineHeight: 1.35, color: 'var(--semantic-text-primary)', textWrap: 'pretty' }}>{title}</div>
          {subTextBottom && <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 17, lineHeight: '25.5px', color: 'var(--base-grey-grey-700)' }}>{subTextBottom}</div>}
        </div>
        {rightItem}
      </div>
      {lowerCTA && <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>{lowerCTA}</div>}
    </div>
  );
}
