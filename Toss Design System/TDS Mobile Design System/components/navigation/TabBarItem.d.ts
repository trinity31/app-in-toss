import * as React from 'react';

/** Single bottom tab: 24px glyph over an 11px label. */
export interface TabBarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  selected?: boolean;
  redDot?: boolean;
}
export declare function TabBarItem(props: TabBarItemProps): JSX.Element;
