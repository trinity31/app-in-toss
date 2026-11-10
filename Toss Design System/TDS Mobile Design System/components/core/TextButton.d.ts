import * as React from 'react';

/** Low-emphasis inline text action; often the tailing accessory of a List Header. */
export interface TextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  size?: 'S' | 'M' | 'L';
  color?: 'brand' | 'neutral';
  appearance?: 'clear' | 'arrow' | 'underline';
  disabled?: boolean;
}
export declare function TextButton(props: TextButtonProps): JSX.Element;
