import * as React from 'react';

/**
 * Primary action button — the strongest affordance on a screen.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  /** S 32px / M 38px / L 48px / XL 56px — heights are verbatim from TDS. */
  size?: 'S' | 'M' | 'L' | 'XL';
  color?: 'brand' | 'neutral' | 'danger' | 'inverse';
  variant?: 'fill' | 'weak';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}
export declare function Button(props: ButtonProps): JSX.Element;
