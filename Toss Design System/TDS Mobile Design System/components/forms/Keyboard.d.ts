import * as React from 'react';

/**
 * iOS system keyboard for full-screen mockups — a 375×292 image, exactly as the
 * source file defines it. Decoration only; wire real input to the field itself.
 * The bitmap path resolves from the loaded bundle, so no path prop is needed.
 */
export interface KeyboardProps extends React.HTMLAttributes<HTMLDivElement> {}
export declare function Keyboard(props: KeyboardProps): JSX.Element;
