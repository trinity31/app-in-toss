import * as React from 'react';

/** Indeterminate loading indicator. */
export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'S' | 'M' | 'L';
  color?: 'brand' | 'neutral' | 'inverse';
  label?: React.ReactNode;
}
export declare function Loader(props: LoaderProps): JSX.Element;
