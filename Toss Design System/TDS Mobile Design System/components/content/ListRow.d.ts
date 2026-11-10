import * as React from 'react';

/**
 * Standard list row — the most-used component in TDS.
 */
export interface ListRowProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Small caption ABOVE the title. */
  subText?: React.ReactNode;
  /** 30×30 icon, logo, avatar or image. */
  leftAccessory?: React.ReactNode;
  /** Switch, Checkbox, Badge, IconButton or chevron. */
  rightAccessory?: React.ReactNode;
  rightText?: React.ReactNode;
  verticalPadding?: 'S' | 'M' | 'L' | 'XL';
  sideMargin?: 'none' | 'S' | 'M';
  onClick?: () => void;
}
export declare function ListRow(props: ListRowProps): JSX.Element;
