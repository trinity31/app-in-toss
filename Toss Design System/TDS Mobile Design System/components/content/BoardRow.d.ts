import * as React from 'react';

/** Collapsible Q&A row for FAQ and notice boards. */
export interface BoardRowProps extends React.HTMLAttributes<HTMLDivElement> {
  question?: React.ReactNode;
  answer?: React.ReactNode;
  opened?: boolean;
  onToggle?: () => void;
}
export declare function BoardRow(props: BoardRowProps): JSX.Element;
