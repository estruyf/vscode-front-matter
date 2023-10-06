import * as React from 'react';

export interface ISpinnerProps { }

export const Spinner: React.FunctionComponent<ISpinnerProps> = (
  _: React.PropsWithChildren<ISpinnerProps>
) => {
  return (
    <div className={`z-50 fixed top-0 left-0 right-0 bottom-0 w-full h-full bg-[var(--vscode-editor-background)] opacity-75`}>
      <div
        className={`absolute top-0 w-full h-[2px] `}
      >
        <div className={`h-full absolute rounded-sm bg-[var(--vscode-activityBarBadge-background)] animate-[vscode-loader_4s_ease-in-out_infinite]`} />
      </div>
    </div>
  );
};