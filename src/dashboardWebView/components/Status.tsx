import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsAtom } from '../state';

export interface IStatusProps {
  draft: boolean | string;
}

export const Status: React.FunctionComponent<IStatusProps> = ({draft}: React.PropsWithChildren<IStatusProps>) => {
  const settings = useRecoilValue(SettingsAtom);

  if (settings?.draftField && settings.draftField.type === "choice") {
    if (draft) {
      return <span className={`inline-block px-2 py-1 leading-none rounded-full font-semibold uppercase tracking-wide text-xs text-whisper-200 dark:text-vulcan-500 bg-teal-500`}>{draft}</span>;
    } else {
      return null;
    }
  }

  return (
    <span className={`inline-block px-2 py-1 leading-none rounded-full font-semibold uppercase tracking-wide text-xs text-whisper-200 dark:text-vulcan-500 ${draft ? "bg-red-500" : "bg-teal-500"}`}>{draft ? "Draft" : "Published"}</span>
  );
};