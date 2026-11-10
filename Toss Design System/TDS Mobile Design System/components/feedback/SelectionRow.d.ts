import * as React from 'react';

/** Single-select row used in the Bottom Sheet selector body. */
export interface SelectionRowProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  leftAccessory?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}
export declare function SelectionRow(props: SelectionRowProps): JSX.Element;
