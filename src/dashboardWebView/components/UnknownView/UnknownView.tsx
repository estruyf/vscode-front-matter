import { StopIcon } from '@heroicons/react/outline';
import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IUnknownViewProps { }

export const UnknownView: React.FunctionComponent<IUnknownViewProps> = (
  _: React.PropsWithChildren<IUnknownViewProps>
) => {
  const { getColors } = useThemeColors();

  return (
    <div className={`w-full h-full flex items-center justify-center`}>
      <div className={`flex flex-col items-center ${getColors(`text-gray-500 dark:text-whisper-900`, `text-[var(--frontmatter-text)]`)}`}>
        <StopIcon className="w-32 h-32" />
        <p className="text-3xl mt-2">
          {l10n.t(LocalizationKey.dashboardUnkownViewTitle)}
        </p>
        <p className="text-xl mt-4">
          {l10n.t(LocalizationKey.dashboardUnkownViewDescription)}
        </p>
      </div>
    </div>
  );
};
