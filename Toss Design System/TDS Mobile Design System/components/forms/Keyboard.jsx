import React from 'react';

/* Resolve project-root-relative assets from the bundle's own script URL, so the
   component works at any page depth and needs no path prop. */
function tdsAsset(rel) {
  if (typeof document === 'undefined') return rel;
  const tag = document.querySelector('script[src*="_ds_bundle.js"]');
  if (!tag) return rel;
  try { return new URL(rel, new URL(tag.getAttribute('src'), document.baseURI)).href; }
  catch { return rel; }
}

/** iOS system keyboard — the 375×292 bitmap the source file ships. */
export function Keyboard({ style, ...rest }) {
  return (
    <div style={{ position: 'relative', width: '100%', height: 292, flexShrink: 0, ...style }} {...rest}>
      <img src={tdsAsset('assets/images/keyboard-ios.png')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );
}
