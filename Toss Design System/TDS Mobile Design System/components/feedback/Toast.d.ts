import * as React from 'react';

/** Transient confirmation. Dark translucent capsule, blur 30. */
export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  leading?: React.ReactNode;
  action?: React.ReactNode;
  onAction?: () => void;
  position?: 'top' | 'bottom';
}
export declare function Toast(props: ToastProps): JSX.Element;
