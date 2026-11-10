import * as React from 'react';

/** Five-star rating. Read-only by default. */
export interface RatingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  /** full = stars + numeric value; compact = stars only; iconOnly = one star + value. */
  kind?: 'full' | 'compact' | 'iconOnly';
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (next: number) => void;
}
export declare function Rating(props: RatingProps): JSX.Element;
