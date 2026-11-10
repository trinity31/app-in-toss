import React from 'react';

const FILLS = {
  filled: 'var(--base-yellow-yellow-500)',
  empty: 'var(--base-grey-grey-200)',
  disabled: 'var(--base-grey-grey-100)',
};

/** One rating star: filled, half, empty or disabled. */
export function StarIcon({ state = 'filled', size = 24, style, ...rest }) {
  const d = 'M 12 1.6 L 15.05 8.03 L 21.9 8.95 L 16.9 13.87 L 18.13 20.8 L 12 17.5 L 5.87 20.8 L 7.1 13.87 L 2.1 8.95 L 8.95 8.03 Z';
  const id = React.useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} {...rest}>
      {state === 'half' && (
        <defs><linearGradient id={id}><stop offset="50%" stopColor="var(--base-yellow-yellow-500)" /><stop offset="50%" stopColor="var(--base-grey-grey-200)" /></linearGradient></defs>
      )}
      <path d={d} fill={state === 'half' ? `url(#${id})` : (FILLS[state] || FILLS.filled)} />
    </svg>
  );
}
