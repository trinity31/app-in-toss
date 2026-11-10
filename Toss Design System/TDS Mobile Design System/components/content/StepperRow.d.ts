import * as React from 'react';

/** Single step row with its rail segment. */
export interface StepperRowProps extends React.HTMLAttributes<HTMLDivElement> {
  num?: number;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Omit the trailing rail segment. */
  last?: boolean;
  theme?: 'light' | 'dark';
  typography?: 'S' | 'M' | 'L';
}
export declare function StepperRow(props: StepperRowProps): JSX.Element;
