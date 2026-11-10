import * as React from 'react';

/** Slider handle. The only element in TDS using the two-layer medium shadow. */
export interface SliderKnobProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'blue' | 'red' | 'black';
  size?: number;
}
export declare function SliderKnob(props: SliderKnobProps): JSX.Element;
