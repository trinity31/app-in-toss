import * as React from 'react';

/** Icon-only button: Fill (grey tint), Border (hairline) or Clear. */
export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  /** L 32px / M 38px / S 48px — the source names sizes inversely to pixels; kept verbatim. */
  size?: 'L' | 'M' | 'S';
  variant?: 'fill' | 'border' | 'clear';
  disabled?: boolean;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
