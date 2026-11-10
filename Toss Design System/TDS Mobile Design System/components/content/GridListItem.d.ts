import * as React from 'react';

/** One 74pt tile: 28px resource above a 14px label. */
export interface GridListItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}
export declare function GridListItem(props: GridListItemProps): JSX.Element;
