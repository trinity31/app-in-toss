import * as React from 'react';

/** Leading accessory of a list row. */
export interface LeftAccessoryProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'icon' | 'image' | 'text';
  children?: React.ReactNode;
  src?: string;
  text?: React.ReactNode;
  size?: number;
  shape?: 'circle' | 'squircle' | 'card' | 'square';
  align?: 'center' | 'top';
}
export declare function LeftAccessory(props: LeftAccessoryProps): JSX.Element;
