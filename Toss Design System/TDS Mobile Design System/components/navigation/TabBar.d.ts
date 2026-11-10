import * as React from 'react';

export interface TabBarItem { label: React.ReactNode; icon?: React.ReactNode; redDot?: boolean }

/** Persistent bottom navigation, 43pt tall. */
export interface TabBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: TabBarItem[];
  value?: number;
  onChange?: (index: number) => void;
}
export declare function TabBar(props: TabBarProps): JSX.Element;
