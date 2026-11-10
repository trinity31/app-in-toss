import * as React from 'react';

/** Underlined section tabs inside a screen. */
export interface TabProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: React.ReactNode[];
  value?: number;
  /** fixed = equal widths; fluid = content width, horizontally scrollable. */
  alignment?: 'fixed' | 'fluid';
  size?: 'S' | 'L';
  onChange?: (index: number) => void;
}
export declare function Tab(props: TabProps): JSX.Element;
