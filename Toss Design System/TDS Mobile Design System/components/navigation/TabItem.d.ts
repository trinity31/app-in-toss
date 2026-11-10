import * as React from 'react';

/** Single tab of a tab strip. */
export interface TabItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  selected?: boolean;
  size?: 'S' | 'L';
}
export declare function TabItem(props: TabItemProps): JSX.Element;
