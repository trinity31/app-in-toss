import * as React from 'react';

/** 34pt safe-area strip with the iOS home indicator. */
export interface HomeIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  theme?: 'light' | 'dark';
}
export declare function HomeIndicator(props: HomeIndicatorProps): JSX.Element;
