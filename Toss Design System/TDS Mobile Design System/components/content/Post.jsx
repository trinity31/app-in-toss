import React from 'react';

const H = { h1: { fs: 28, pt: 24 }, h2: { fs: 22, pt: 16 }, h3: { fs: 20, pt: 16 }, h4: { fs: 17, pt: 12 } };
const P = { M: 17, S: 15, XS: 13 };

/** Long-form article blocks: headings, paragraphs, ordered/unordered lists. */
export function Post({ blocks = [], style, ...rest }) {
  return (
    <div style={{ background: 'var(--semantic-background-default)', ...style }} {...rest}>
      {blocks.map((b, i) => {
        if (H[b.type]) {
          const h = H[b.type];
          return <div key={i} style={{ boxSizing: 'border-box', padding: `${h.pt}px var(--tds-side-padding-m) 24px`, fontFamily: 'var(--tds-font-body)', fontWeight: 700, fontSize: h.fs, lineHeight: 1.35, color: 'var(--semantic-text-secondary)', textWrap: 'pretty' }}>{b.text}</div>;
        }
        if (b.type === 'paragraph') {
          return <div key={i} style={{ boxSizing: 'border-box', padding: '0 var(--tds-side-padding-m) 16px', fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: P[b.size || 'M'], lineHeight: 1.6, color: 'var(--semantic-text-secondary)', textWrap: 'pretty' }}>{b.text}</div>;
        }
        const ordered = b.type === 'ordered';
        return (
          <div key={i} style={{ boxSizing: 'border-box', padding: '0 var(--tds-side-padding-m) 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(b.items || []).map((it, j) => (
              <div key={j} style={{ display: 'flex', gap: 8 }}>
                <span style={{ width: ordered ? 24 : 16, textAlign: ordered ? 'right' : 'center', flexShrink: 0, fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: P[b.size || 'M'], lineHeight: 1.5, color: 'var(--semantic-text-secondary)' }}>{ordered ? `${j + 1}.` : '•'}</span>
                <span style={{ flex: 1, fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: P[b.size || 'M'], lineHeight: 1.5, color: 'var(--semantic-text-secondary)', textWrap: 'pretty' }}>{it}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
