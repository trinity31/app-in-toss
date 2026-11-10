import React from 'react';

/** Numbered or icon marker on a Stepper rail. */
export function StepIcon({ num, icon, theme = 'light', size = 'M', style, ...rest }) {
  const d = size === 'S' ? 20 : 24;
  return (
    <div style={{
      width: d, height: d, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: theme === 'dark' ? 'var(--base-grey-grey-800)' : 'var(--semantic-fill-neutral-weak)',
      color: theme === 'dark' ? 'rgb(255,255,255)' : 'var(--semantic-text-tertiary)',
      fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: size === 'S' ? 11 : 13, lineHeight: 1, ...style,
    }} {...rest}>{icon || num}</div>
  );
}
