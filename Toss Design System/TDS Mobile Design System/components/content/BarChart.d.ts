import * as React from 'react';

/** Simple vertical bar chart used for spend and balance trends. */
export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 1–12 values (0–100 scale, or any scale — the max is normalised). */
  values?: number[];
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'grey' | 'white';
  /** Index of the single emphasised bar; all others go grey. */
  highlight?: number | null;
  height?: number;
  labels?: React.ReactNode[];
}
export declare function BarChart(props: BarChartProps): JSX.Element;
