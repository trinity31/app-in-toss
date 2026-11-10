import * as React from 'react';

/** Centred outcome screen: asset, title, description, optional action. */
export interface ResultProps extends React.HTMLAttributes<HTMLDivElement> {
  asset?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}
export declare function Result(props: ResultProps): JSX.Element;
