import * as React from 'react';

export interface MenuItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  selected?: boolean;
  danger?: boolean;
}

/** Popover action list anchored to an icon button. */
export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  items?: MenuItem[];
  onSelect?: (item: MenuItem, index: number) => void;
}
export declare function Menu(props: MenuProps): JSX.Element;
