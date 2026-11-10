import * as React from 'react';

/** Quantity stepper: minus button, white value field, plus button. */
export interface NumericSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  min?: number;
  max?: number;
  size?: 'XS' | 'S' | 'M' | 'L';
  disabled?: boolean;
  onChange?: (next: number) => void;
}
export declare function NumericSpinner(props: NumericSpinnerProps): JSX.Element;
