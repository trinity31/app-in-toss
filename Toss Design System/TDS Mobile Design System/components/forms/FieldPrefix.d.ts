import * as React from 'react';

/** Non-editable text affix ("원", "%", "+82") rendered inside a field. */
export interface FieldPrefixProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  side?: 'prefix' | 'suffix';
}
export declare function FieldPrefix(props: FieldPrefixProps): JSX.Element;
