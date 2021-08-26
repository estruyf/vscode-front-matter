import * as React from 'react';

export interface IStatusProps {
  draft: boolean;
}

export const Status: React.FunctionComponent<IStatusProps> = ({draft}: React.PropsWithChildren<IStatusProps>) => {
  return (
    <span className={`inline-block px-2 py-1 leading-none rounded-full font-semibold uppercase tracking-wide text-xs text-whisper-200 dark:text-vulcan-500 ${draft ? "bg-red-500" : "bg-teal-500"}`}>{draft ? "Draft" : "Published"}</span>
  );
};