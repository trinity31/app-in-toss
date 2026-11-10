import * as React from 'react';

/** Two-to-four mutually exclusive options in a grey track. */
export interface SegmentedControlProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: React.ReactNode[];
  value?: number;
  size?: 'S' | 'L';
  onChange?: (index: number) => void;
}
export declare function SegmentedControl(props: SegmentedControlProps): JSX.Element;
