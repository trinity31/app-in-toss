import * as React from 'react';

/** Masked input with a visibility toggle — the "Password" field type. */
export interface PasswordFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label?: React.ReactNode;
  value?: string;
  placeholder?: string;
  helpText?: React.ReactNode;
  error?: boolean;
  disabled?: boolean;
  variant?: 'line' | 'box';
  onChange?: (next: string) => void;
}
export declare function PasswordField(props: PasswordFieldProps): JSX.Element;
