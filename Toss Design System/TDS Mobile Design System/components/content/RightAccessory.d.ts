import * as React from 'react';

/** Trailing accessory of a list row. */
export interface RightAccessoryProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: React.ReactNode;
  subText?: React.ReactNode;
  arrow?: 'none' | 'right' | 'up' | 'down';
  align?: 'left' | 'right';
  /** Switch, Checkbox, Badge or IconButton placed before the chevron. */
  children?: React.ReactNode;
}
export declare function RightAccessory(props: RightAccessoryProps): JSX.Element;
