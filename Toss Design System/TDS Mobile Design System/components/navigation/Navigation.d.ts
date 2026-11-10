import * as React from 'react';

/**
 * Top navigation bar for a mini-app running inside the host wallet.
 */
export interface NavigationProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  /** Square service logo, 18×18 at radius 6. */
  logoSrc?: string;
  showBack?: boolean;
  theme?: 'light' | 'dark';
  /** Optional service-owned icon in its own blurred capsule. */
  dynamicIcon?: React.ReactNode;
  onBack?: () => void;
  onMore?: () => void;
  onClose?: () => void;
}
export declare function Navigation(props: NavigationProps): JSX.Element;
