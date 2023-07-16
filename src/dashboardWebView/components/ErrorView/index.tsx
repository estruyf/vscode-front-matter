import { ExclamationIcon } from '@heroicons/react/solid';
import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IErrorViewProps { }

export const ErrorView: React.FunctionComponent<IErrorViewProps> = (
  _: React.PropsWithChildren<IErrorViewProps>
) => {
  const { getColors } = useThemeColors();

  return (
    <main className={`h-full w-full flex flex-col justify-center items-center space-y-2`}>
      <ExclamationIcon className={`w-24 h-24 ${getColors(`text-red-500`, `text-[var(--vscode-editorError-foreground)]`)}`} />
      <p className="text-xl">{l10n.t(LocalizationKey.commonErrorMessage)}</p>
      <p className="text-base">{l10n.t(LocalizationKey.dashboardErrorViewDescription)}</p>
    </main>
  );
};
