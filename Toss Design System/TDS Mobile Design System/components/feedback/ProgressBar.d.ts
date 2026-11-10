import * as React from 'react';

/** Horizontal determinate progress track (0–100). */
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  size?: 'S' | 'M' | 'L';
  color?: 'brand' | 'neutral' | 'success' | 'danger';
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
