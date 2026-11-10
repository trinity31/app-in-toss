import * as React from 'react';

/** Centre text stack of a list row, usable standalone in custom rows. */
export interface ListRowTextProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  subText?: React.ReactNode;
  /** Whether the title sits above or below the description. */
  mainTextPosition?: 'top' | 'bottom';
  titleWeight?: 400 | 510 | 590 | 700;
  titleStyle?: 'default' | 'small';
}
export declare function ListRowText(props: ListRowTextProps): JSX.Element;
