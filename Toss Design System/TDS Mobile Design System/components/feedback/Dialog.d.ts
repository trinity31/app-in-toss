import * as React from 'react';

/**
 * Blocking alert (one button) or confirm (two buttons).
 */
export interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  kind?: 'alert' | 'confirm';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Render the 20 %-black dim layer behind the card. */
  dim?: boolean;
}
export declare function Dialog(props: DialogProps): JSX.Element;
