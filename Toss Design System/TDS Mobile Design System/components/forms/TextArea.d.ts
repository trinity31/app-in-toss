import * as React from 'react';

/** Multi-line input — the Text Field "TextArea" field type. */
export interface TextAreaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: React.ReactNode;
  value?: string;
  placeholder?: string;
  helpText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  rows?: number;
  /** Shows a live character counter on the right of the help row. */
  maxLength?: number;
  onChange?: (next: string) => void;
}
export declare function TextArea(props: TextAreaProps): JSX.Element;
