import * as React from 'react';

/**
 * Device status bar for full-screen mockups.
 * iOS is 50px tall and renders the time / wifi / signal SVGs extracted from the source file,
 * embedded as data URIs so there is no path to resolve at any page depth.
 * Android is the source's 24px `rgba(33,33,33,0.08)` plate with the 46×10 status mask and
 * **no clock** — `/z_System-Components/components/AndroidStatusBar` genuinely omits the time.
 */
export interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  os?: 'ios' | 'android';
  theme?: 'light' | 'dark';
}
export declare function StatusBar(props: StatusBarProps): JSX.Element;
