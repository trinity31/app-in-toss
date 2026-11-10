import * as React from 'react';

/** Single increment or decrement button. */
export interface StepButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: 'plus' | 'minus';
  size?: 'S' | 'M' | 'L';
  disabled?: boolean;
}
export declare function StepButton(props: StepButtonProps): JSX.Element;
