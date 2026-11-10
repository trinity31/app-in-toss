import * as React from 'react';

/** Label/value pair for specification and receipt tables. */
export interface TableRowProps extends React.HTMLAttributes<HTMLDivElement> {
  left?: React.ReactNode;
  right?: React.ReactNode;
  align?: 'left' | 'space-between';
  /** Left column width percentage: 20 / 40 / 50 / 60 / 80. */
  leftRatio?: number;
}
export declare function TableRow(props: TableRowProps): JSX.Element;
