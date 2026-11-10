import * as React from 'react';

/**
 * Screen-opening title block ("Top") sitting directly under the navigation bar.
 */
export interface TopProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subTextTop?: React.ReactNode;
  subTextBottom?: React.ReactNode;
  /** Avatar / logo / illustration above the title. */
  resource?: React.ReactNode;
  /** Small button or badge aligned right of the title. */
  rightItem?: React.ReactNode;
  lowerCTA?: React.ReactNode;
}
export declare function Top(props: TopProps): JSX.Element;
