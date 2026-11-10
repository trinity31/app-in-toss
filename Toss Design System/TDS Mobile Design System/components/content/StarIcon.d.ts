import * as React from 'react';

/** Single rating star primitive. */
export interface StarIconProps extends React.SVGAttributes<SVGSVGElement> {
  state?: 'filled' | 'half' | 'empty' | 'disabled';
  size?: number;
}
export declare function StarIcon(props: StarIconProps): JSX.Element;
