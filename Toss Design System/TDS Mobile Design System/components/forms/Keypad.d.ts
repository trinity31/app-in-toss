import * as React from 'react';

/** In-app numeric keypad for amounts and PINs. */
export interface KeypadProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Receives the pressed key: '0'–'9' or '⌫'. */
  onKey?: (key: string) => void;
}
export declare function Keypad(props: KeypadProps): JSX.Element;
