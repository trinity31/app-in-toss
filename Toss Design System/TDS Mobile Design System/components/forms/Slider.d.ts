import * as React from 'react';

/** Draggable range control. Knob and fill share one colour. */
export interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number;
  min?: number;
  max?: number;
  color?: 'blue' | 'red' | 'black';
  /** 2 labels = Min/Max layout, 3 = Min/Mid/Max. */
  labels?: string[];
  tooltip?: boolean;
  onChange?: (next: number) => void;
}
export declare function Slider(props: SliderProps): JSX.Element;
