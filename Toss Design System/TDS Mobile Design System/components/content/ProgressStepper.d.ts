import * as React from 'react';

/** Horizontal "step N of M" indicator for linear flows. */
export interface ProgressStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 3, 4 or 5. */
  steps?: number;
  /** Zero-based index of the active step. */
  current?: number;
  labels?: React.ReactNode[];
}
export declare function ProgressStepper(props: ProgressStepperProps): JSX.Element;
