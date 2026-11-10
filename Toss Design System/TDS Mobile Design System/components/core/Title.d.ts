import * as React from 'react';

/** Bold section title in four sizes; optionally a tappable selector. */
export interface TitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  size?: 'XS' | 'S' | 'M' | 'L';
  variant?: 'clear' | 'selector' | 'underlined';
  accessory?: React.ReactNode;
  onClick?: () => void;
}
export declare function Title(props: TitleProps): JSX.Element;
