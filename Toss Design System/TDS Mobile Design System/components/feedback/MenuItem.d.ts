import * as React from 'react';

/** Text-only, icon+text or selectable menu row. */
export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  selected?: boolean;
  danger?: boolean;
  pressed?: boolean;
}
export declare function MenuItem(props: MenuItemProps): JSX.Element;
