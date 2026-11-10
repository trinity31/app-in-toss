import * as React from 'react';

/** Compact status pill in six semantic colours and four sizes. */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  size?: 'XS' | 'S' | 'M' | 'L';
  color?: 'blue' | 'red' | 'green' | 'yellow' | 'teal' | 'grey';
  variant?: 'fill' | 'weak';
}
export declare function Badge(props: BadgeProps): JSX.Element;
