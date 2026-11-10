import * as React from 'react';

/** Read-only numeric display on a white elevated card. */
export interface NumberFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: React.ReactNode;
  size?: 'XS' | 'S' | 'M' | 'L';
}
export declare function NumberField(props: NumberFieldProps): JSX.Element;
