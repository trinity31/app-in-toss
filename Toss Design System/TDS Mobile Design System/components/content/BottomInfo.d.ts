import * as React from 'react';

/** Bulleted disclosure block on the grey lower surface. */
export interface BottomInfoProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: React.ReactNode[];
  size?: 'M' | 'L';
  /** 160px fade tail so the block dissolves into the page. Default true. */
  gradient?: boolean;
}
export declare function BottomInfo(props: BottomInfoProps): JSX.Element;
