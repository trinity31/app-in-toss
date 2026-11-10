import * as React from 'react';

/**
 * Android variant of the Apps-in-Toss navigation bar.
 * Same structure as `Navigation` — service pill on the left, blurred ···/✕ capsule
 * on the right — but 54px tall with a 48×48 back button and a 168px title cap.
 * It is NOT a Material top app bar.
 */
export interface NavigationAndroidProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  logoSrc?: string;
  showBack?: boolean;
  theme?: 'light' | 'dark';
  dynamicIcon?: React.ReactNode;
  onBack?: () => void;
  onMore?: () => void;
  onClose?: () => void;
}
export declare function NavigationAndroid(props: NavigationAndroidProps): JSX.Element;
