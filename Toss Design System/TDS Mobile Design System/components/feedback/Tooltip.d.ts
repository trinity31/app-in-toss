import * as React from 'react';

/** Pointed white bubble for onboarding hints and inline explanations. */
export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  size?: 'S' | 'M' | 'L';
  placement?: 'top' | 'bottom';
  align?: 'left' | 'center' | 'right';
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
