import React from 'react';

/** Expandable FAQ / notice row. */
export function BoardRow({ question, answer, opened = false, onToggle, style, ...rest }) {
  return (
    <div style={{ background: 'var(--semantic-background-default)', ...style }} {...rest}>
      <div onClick={onToggle} style={{ boxSizing: 'border-box', display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 16px 16px var(--tds-side-padding-m)', cursor: 'pointer' }}>
        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
          <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 17, lineHeight: 1.35, color: 'var(--semantic-text-brand)' }}>Q</span>
          <span style={{ flex: 1, fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 17, lineHeight: 1.35, color: 'var(--base-grey-grey-900)', textWrap: 'pretty' }}>{question}</span>
        </div>
        <span style={{ width: 24, height: 24, position: 'relative', display: 'inline-block', flexShrink: 0, transform: opened ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform .2s ease' }}>
          <svg width="6.4" height="10.9" viewBox="0 0 6.4 10.9" fill="var(--semantic-icon-quaternary)" style={{ position: 'absolute', left: 8.8, top: 6.5 }}>
            <path d="M 1 0 C 0.8 0 0.5 0.1 0.4 0.3 C 0 0.7 0 1.2 0.4 1.6 L 4.2 5.4 L 0.3 9.3 C -0.1 9.7 -0.1 10.2 0.3 10.6 C 0.7 11 1.2 11 1.6 10.6 L 6.1 6.1 C 6.5 5.7 6.5 5.2 6.1 4.8 L 1.6 0.3 C 1.4 0.2 1.2 0 1 0 Z" fillRule="evenodd" />
          </svg>
        </span>
      </div>
      {opened && answer && (
        <div style={{ boxSizing: 'border-box', display: 'flex', gap: 8, padding: '0 var(--tds-side-padding-m) 20px' }}>
          <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 17, lineHeight: 1.35, color: 'var(--semantic-text-quaternary)' }}>A</span>
          <span style={{ flex: 1, fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.6, color: 'var(--semantic-text-secondary)', textWrap: 'pretty' }}>{answer}</span>
        </div>
      )}
    </div>
  );
}
