import * as React from 'react';

/** Expand / navigate row at the end of a truncated list. */
export interface ListFooterProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  color?: 'grey' | 'blue';
  icon?: 'expand' | 'collapse' | 'move' | 'plus' | 'none';
  onClick?: () => void;
}
export declare function ListFooter(props: ListFooterProps): JSX.Element;
