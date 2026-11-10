import * as React from 'react';

/** Small right-aligned accessory for a List Header. */
export interface HeaderAccessoryProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'S' | 'M';
}
export declare function HeaderAccessory(props: HeaderAccessoryProps): JSX.Element;
