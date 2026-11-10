import * as React from 'react';

export interface PostBlock {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'paragraph' | 'ordered' | 'unordered';
  text?: React.ReactNode;
  items?: React.ReactNode[];
  size?: 'M' | 'S' | 'XS';
}

/** Article renderer for notices, guides and help content. */
export interface PostProps extends React.HTMLAttributes<HTMLDivElement> {
  blocks?: PostBlock[];
}
export declare function Post(props: PostProps): JSX.Element;
