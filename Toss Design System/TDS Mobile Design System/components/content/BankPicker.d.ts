import * as React from 'react';

export interface BankPickerItem { label: React.ReactNode; icon?: React.ReactNode }

/** Grid of bank / securities-firm marks with a single selected tile. */
export interface BankPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: BankPickerItem[];
  columns?: 2 | 3 | 4;
  /** Label of the selected item. */
  value?: string;
  onSelect?: (item: BankPickerItem, index: number) => void;
}
export declare function BankPicker(props: BankPickerProps): JSX.Element;
