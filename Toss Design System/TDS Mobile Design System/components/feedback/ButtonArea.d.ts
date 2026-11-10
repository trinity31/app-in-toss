import * as React from 'react';

/** One- or two-button footer with the right padding for its container. */
export interface ButtonAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  context?: 'dialog' | 'sheet' | 'cta';
  direction?: 'horizontal' | 'vertical';
}
export declare function ButtonArea(props: ButtonAreaProps): JSX.Element;
