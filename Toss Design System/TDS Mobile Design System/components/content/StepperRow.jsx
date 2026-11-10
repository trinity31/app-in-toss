import React from 'react';
import { StepIcon } from './StepIcon.jsx';

/** One row of a Stepper: marker, connecting rail, text. */
export function StepperRow({ num, icon, title, description, last = false, theme = 'light', typography = 'M', style, ...rest }) {
  const fs = { S: 15, M: 17, L: 20 }[typography] || 17;
  return (
    <div style={{ display: 'flex', gap: 12, ...style }} {...rest}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <StepIcon num={num} icon={icon} theme={theme} />
        {!last && <div style={{ flex: 1, width: 2, minHeight: 20, margin: '4px 0', background: 'var(--base-grey-grey-200)' }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
        <div style={{ fontFamily: 'var(--tds-font-body)', fontWeight: 590, fontSize: fs, lineHeight: 1.35, color: 'var(--semantic-text-primary)' }}>{title}</div>
        {description && <div style={{ marginTop: 2, fontFamily: 'var(--tds-font-body)', fontWeight: 400, fontSize: 15, lineHeight: 1.5, color: 'var(--semantic-text-tertiary)' }}>{description}</div>}
      </div>
    </div>
  );
}
