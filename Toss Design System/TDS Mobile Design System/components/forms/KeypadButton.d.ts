import * as React from 'react';

/** 120×63 keypad key, digit or icon. */
export interface KeypadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  kind?: 'num' | 'icon';
  pressed?: boolean;
}
export declare function KeypadButton(props: KeypadButtonProps): JSX.Element;
