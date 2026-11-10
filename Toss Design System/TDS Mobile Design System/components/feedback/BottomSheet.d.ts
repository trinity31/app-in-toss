import * as React from 'react';

/**
 * Modal sheet rising from the bottom edge.
 */
export interface BottomSheetProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  children?: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  dim?: boolean;
}
export declare function BottomSheet(props: BottomSheetProps): JSX.Element;
