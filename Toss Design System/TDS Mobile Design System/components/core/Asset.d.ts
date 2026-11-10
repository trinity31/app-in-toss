import * as React from 'react';

/** Shaped container for an icon, logo, avatar or image. */
export interface AssetProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Bitmap source. Takes precedence over children. */
  src?: string;
  alt?: string;
  /** 16 · 20 · 24 · 28 · 30 · 36 · 40 · 48 · 56 · 64 · 72 */
  size?: number;
  shape?: 'circle' | 'squircle' | 'card' | 'square';
  /** Draw the grey backing plate. Default true. */
  background?: boolean;
}
export declare function Asset(props: AssetProps): JSX.Element;
