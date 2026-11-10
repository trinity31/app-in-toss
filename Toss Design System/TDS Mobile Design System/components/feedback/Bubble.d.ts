import * as React from 'react';

/** Grey speech bubble with a concave tail. */
export interface BubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  side?: 'left' | 'right';
}
export declare function Bubble(props: BubbleProps): JSX.Element;
