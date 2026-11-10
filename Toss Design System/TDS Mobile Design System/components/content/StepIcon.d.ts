import * as React from 'react';

/** Circular step marker. The source draws dedicated glyphs for 1–7. */
export interface StepIconProps extends React.HTMLAttributes<HTMLDivElement> {
  num?: number;
  icon?: React.ReactNode;
  theme?: 'light' | 'dark';
  size?: 'S' | 'M';
}
export declare function StepIcon(props: StepIconProps): JSX.Element;
