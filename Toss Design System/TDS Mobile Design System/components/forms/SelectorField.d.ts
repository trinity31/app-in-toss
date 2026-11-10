import * as React from 'react';

/** Tappable field that opens a Bottom Sheet picker rather than the keyboard. */
export interface SelectorFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  value?: React.ReactNode;
  placeholder?: string;
  helpText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  variant?: 'line' | 'box';
  onClick?: () => void;
}
export declare function SelectorField(props: SelectorFieldProps): JSX.Element;
