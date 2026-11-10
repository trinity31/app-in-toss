import * as React from 'react';

/** Divider between list sections. 1px hairline, or a 12px thick block break. */
export interface BorderProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: 'default' | 'thick';
  /** Left-inset the hairline to the 24px screen gutter. Default true. */
  inset?: boolean;
}
export declare function Border(props: BorderProps): JSX.Element;
