import * as React from 'react';

/** Value readout above or below a slider handle. */
export interface SliderTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  placement?: 'top' | 'bottom';
}
export declare function SliderTooltip(props: SliderTooltipProps): JSX.Element;
