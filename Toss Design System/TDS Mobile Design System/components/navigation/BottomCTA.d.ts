import * as React from 'react';

/**
 * Fixed action area pinned to the bottom of a screen.
 */
export interface BottomCTAProps extends React.HTMLAttributes<HTMLDivElement> {
  /** One or two Buttons, usually size XL and fullWidth. */
  children?: React.ReactNode;
  /** Checkbox, description or TextButton shown above the buttons. */
  upperItem?: React.ReactNode;
  lowerItem?: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
}
export declare function BottomCTA(props: BottomCTAProps): JSX.Element;
