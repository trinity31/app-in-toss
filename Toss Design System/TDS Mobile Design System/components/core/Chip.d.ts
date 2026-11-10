import * as React from 'react';

/**
 * Filter / selection chip.
 */
export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  size?: 'S' | 'M';
  shape?: 'pill' | 'square';
  variant?: 'fill' | 'weak';
  selected?: boolean;
  leading?: React.ReactNode;
  tailing?: React.ReactNode;
  redDot?: boolean;
  onClick?: () => void;
}
export declare function Chip(props: ChipProps): JSX.Element;
