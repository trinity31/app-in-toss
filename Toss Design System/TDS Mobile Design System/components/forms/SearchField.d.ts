import * as React from 'react';

/** Full-width search bar, pinned under the navigation bar. */
export interface SearchFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string;
  placeholder?: string;
  onChange?: (next: string) => void;
  onClear?: () => void;
}
export declare function SearchField(props: SearchFieldProps): JSX.Element;
