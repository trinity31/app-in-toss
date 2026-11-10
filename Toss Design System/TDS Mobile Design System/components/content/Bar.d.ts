import * as React from 'react';

/** One column of a bar chart, in the seven source colour themes. */
export interface BarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'grey' | 'white';
  /** Render grey because another bar is highlighted. */
  muted?: boolean;
  width?: number;
  height?: number;
}
export declare function Bar(props: BarProps): JSX.Element;
