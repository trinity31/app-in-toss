import * as React from 'react';

/**
 * Labelled single-line input.
 */
export interface TextFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: React.ReactNode;
  value?: string;
  placeholder?: string;
  helpText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  variant?: 'line' | 'box';
  type?: string;
  suffix?: React.ReactNode;
  onChange?: (next: string) => void;
}
export declare function TextField(props: TextFieldProps): JSX.Element;
