import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsAtom } from '../state';

export interface IStatusProps {
  draft: boolean | string;
}

export const Status: React.FunctionComponent<IStatusProps> = ({draft}: React.PropsWithChildren<IStatusProps>) => {
  const settings = useRecoilValue(SettingsAtom);
  const draftField = useMemo(() => settings?.draftField, [settings]);
  const draftValue = useMemo(() => {
    if (draftField && draftField.type === 'choice') {
      return draft;
    } else if (draftField && typeof draftField.invert !== 'undefined' && draftField.invert) {
      return !draft;
    } else {
      return draft;
    }
  }, [draftField]);

  if (settings?.draftField && settings.draftField.type === "choice") {
    if (draftValue) {
      return <span className={`inline-block px-2 py-1 leading-none rounded-sm font-semibold uppercase tracking-wide text-xs text-whisper-200 dark:text-vulcan-500 bg-teal-500`}>{draftValue}</span>;
    } else {
      return null;
    }
  }

  return (
    <span className={`inline-block px-2 py-1 leading-none rounded-sm font-semibold uppercase tracking-wide text-xs text-whisper-200 dark:text-vulcan-500 ${draftValue ? "bg-red-500" : "bg-teal-500"}`}>
      {draftValue ? "Draft" : "Published"}
    </span>
  );
};