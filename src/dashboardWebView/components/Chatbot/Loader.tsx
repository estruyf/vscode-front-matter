import * as React from 'react';

export interface ILoaderProps { }

export const Loader: React.FunctionComponent<ILoaderProps> = (props: React.PropsWithChildren<ILoaderProps>) => {
  return (
    <div>
      <div className="mt-4 flex items-center justify-center space-x-2 animate-pulse">
        <div className="w-4 h-4 bg-[var(--frontmatter-button-background)] rounded-full"></div>
        <div className="w-4 h-4 bg-[var(--frontmatter-button-background)] rounded-full"></div>
        <div className="w-4 h-4 bg-[var(--frontmatter-button-background)] rounded-full"></div>
      </div>
    </div>
  );
};