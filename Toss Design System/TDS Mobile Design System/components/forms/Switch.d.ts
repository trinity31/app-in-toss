import * as React from 'react';

/** On/off toggle for a setting that applies immediately. */
export interface SwitchProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
}
export declare function Switch(props: SwitchProps): JSX.Element;
