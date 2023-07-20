import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import useThemeColors from '../../hooks/useThemeColors';
import { SettingsAtom } from '../../state';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IStatusProps {
  draft: boolean | string;
}

export const Status: React.FunctionComponent<IStatusProps> = ({
  draft
}: React.PropsWithChildren<IStatusProps>) => {
  const { getColors } = useThemeColors();
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
  }, [draftField, draft]);

  if (settings?.draftField && settings.draftField.type === 'choice') {
    if (draftValue) {
      return (
        <span
          className={`inline-block px-2 py-1 leading-none rounded-sm font-semibold uppercase tracking-wide text-xs ${getColors(`text-whisper-200 dark:text-vulcan-500 bg-teal-500`, `text-[var(--vscode-badge-foreground)] bg-[var(--vscode-badge-background)]`)}`}
        >
          {draftValue}
        </span>
      );
    } else {
      return null;
    }
  }

  return (
    <span
      className={`draft__status
        inline-block px-2 py-1 leading-none rounded-sm font-semibold uppercase tracking-wide text-xs 
        ${getColors(`text-whisper-200 dark:text-vulcan-500`, ``)} 
        ${draftValue ?
          getColors(`bg-red-500`, 'bg-[var(--vscode-statusBarItem-errorBackground)] text-[var(--vscode-statusBarItem-errorForeground)]') :
          getColors(`bg-teal-500`, 'bg-[var(--vscode-badge-background)] text-[var(--vscode-badge-foreground)]')
        }`}
    >
      {draftValue ? l10n.t(LocalizationKey.dashboardContentsStatusDraft) : l10n.t(LocalizationKey.dashboardContentsStatusPublished)}
    </span>
  );
};
