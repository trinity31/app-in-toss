import React from 'react';
import { Asset } from '../core/Asset.jsx';

/** Left slot of a list row: icon, image, or a short text marker. */
export function LeftAccessory({ type = 'icon', children, src, text, size = 30, shape = 'circle', align = 'center', style, ...rest }) {
  if (type === 'text') {
    return (
      <div style={{ display: 'flex', alignItems: align === 'top' ? 'flex-start' : 'center', minWidth: 24, ...style }} {...rest}>
        <span style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: 15, lineHeight: 1.35, color: 'var(--semantic-text-tertiary)' }}>{text}</span>
      </div>
    );
  }
  return <Asset size={size} shape={shape} src={type === 'image' ? src : undefined} background={type !== 'image'} style={style} {...rest}>{children}</Asset>;
}
