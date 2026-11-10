import * as React from 'react';

/** Accessory slot for a Chip. Leading is 18/16px, tailing 16/14px. */
export interface ChipAccessoryProps extends React.HTMLAttributes<HTMLSpanElement> {
  kind?: 'icon' | 'profile' | 'downChevron' | 'close';
  side?: 'leading' | 'tailing';
  size?: 'S' | 'M';
  children?: React.ReactNode;
  src?: string;
}
export declare function ChipAccessory(props: ChipAccessoryProps): JSX.Element;
