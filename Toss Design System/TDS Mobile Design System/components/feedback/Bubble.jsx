import React from 'react';

/** Speech bubble with a curved tail — used in guides and chat-like copy. */
export function Bubble({ children, side = 'left', style, ...rest }) {
  const tail = (
    <svg width="15.306" height="17.338" viewBox="0 0 15.306 17.338" fill="var(--base-grey-grey-200)" style={{ transform: side === 'right' ? 'scaleX(-1)' : 'none', flexShrink: 0 }}>
      <path d="M 1.184 17.338 C -0.112 17.338 -0.465 15.798 0.736 15.369 C 3.856 14.268 5.976 11.575 6 8.608 L 6 0 L 8.413 0 L 8.413 0.908 C 8.413 5.507 10.827 9.75 14.854 12.442 C 15.16 12.646 15.337 12.973 15.301 13.309 C 15.278 13.646 15.066 13.952 14.724 14.125 C 10.709 16.175 5.976 17.317 1.184 17.338 Z" fillRule="nonzero" />
    </svg>
  );
  const body = (
    <div style={{
      boxSizing: 'border-box', borderRadius: 16, background: 'var(--base-grey-grey-200)',
      padding: side === 'left' ? '12px 14px 12px 19px' : '12px 19px 12px 14px',
      fontFamily: 'var(--tds-font-body)', fontWeight: 510, fontSize: 17, lineHeight: '25.5px',
      color: 'var(--semantic-text-primary)',
    }}>{children}</div>
  );
  return (
    <div style={{ display: 'inline-flex', alignItems: 'flex-end', gap: -10, ...style }} {...rest}>
      {side === 'left' ? <>{tail}{body}</> : <>{body}{tail}</>}
    </div>
  );
}
