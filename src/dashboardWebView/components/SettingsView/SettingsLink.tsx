import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { CogIcon } from '@heroicons/react/24/solid';
import { NavigationType } from '../../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ISettingsLinkProps {
  onNavigate: (navigationType: NavigationType) => void;
}

export const SettingsLink: React.FunctionComponent<ISettingsLinkProps> = ({
  onNavigate
}: React.PropsWithChildren<ISettingsLinkProps>) => {
  const settings = useRecoilValue(SettingsSelector);

  if (!settings) {
    return null;
  }

  return (
    <button
      className="flex items-center mr-4 hover:text-[var(--vscode-textLink-activeForeground)]"
      title={l10n.t(LocalizationKey.commonSettings)}
      onClick={() => onNavigate(NavigationType.Settings)}
    >
      <CogIcon className="h-4 w-4" />
      <span className='sr-only'>{l10n.t(LocalizationKey.commonSettings)}</span>
    </button>
  );
};