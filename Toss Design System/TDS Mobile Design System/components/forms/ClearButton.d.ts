import * as React from 'react';

/** Clear-value affordance for text and search fields. */
export interface ClearButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
}
export declare function ClearButton(props: ClearButtonProps): JSX.Element;
