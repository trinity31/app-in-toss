import * as React from 'react';

/** Body slot of a Bottom Sheet — list rows, a paragraph, a selector or a centred asset. */
export interface SheetBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  kind?: 'list' | 'selection' | 'paragraph' | 'asset';
}
export declare function SheetBody(props: SheetBodyProps): JSX.Element;
