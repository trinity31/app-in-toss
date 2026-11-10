import * as React from 'react';

/** Single segment; white elevated pill when selected. */
export interface SegmentedItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  selected?: boolean;
  size?: 'S' | 'M';
}
export declare function SegmentedItem(props: SegmentedItemProps): JSX.Element;
