import * as React from 'react';

/** Circle-filled or bare line checkmark. */
export interface CheckboxProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  checked?: boolean;
  variant?: 'circle' | 'line';
  size?: 'XS' | 'S' | 'M' | 'L';
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
