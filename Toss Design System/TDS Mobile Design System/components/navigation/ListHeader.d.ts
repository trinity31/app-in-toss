import * as React from 'react';

/** Titled divider that opens a list section. */
export interface ListHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subText?: React.ReactNode;
  subTextPosition?: 'upper' | 'lower';
  /** Tailing accessory: TextButton, Badge or icon. */
  accessory?: React.ReactNode;
  size?: 'XS' | 'S' | 'M' | 'L';
}
export declare function ListHeader(props: ListHeaderProps): JSX.Element;
