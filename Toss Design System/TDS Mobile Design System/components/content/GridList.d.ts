import * as React from 'react';

export interface GridListItem { label: React.ReactNode; icon?: React.ReactNode }

/** Tile grid for shortcuts, bank pickers and category menus. */
export interface GridListProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: GridListItem[];
  columns?: 2 | 3 | 4;
  onSelect?: (item: GridListItem, index: number) => void;
}
export declare function GridList(props: GridListProps): JSX.Element;
