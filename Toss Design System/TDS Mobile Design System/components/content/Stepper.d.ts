import * as React from 'react';

export interface StepperStep { title: React.ReactNode; description?: React.ReactNode; icon?: React.ReactNode }

/** Vertical list of ordered steps with a connecting rail. */
export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps?: StepperStep[];
  variant?: 'number' | 'icon';
  theme?: 'light' | 'dark';
}
export declare function Stepper(props: StepperProps): JSX.Element;
