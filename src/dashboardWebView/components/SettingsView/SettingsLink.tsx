import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { CogIcon } from '@heroicons/react/24/solid';
import { NavigationType } from '../../models';

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
      title={`Settings`}
      onClick={() => onNavigate(NavigationType.Settings)}
    >
      <CogIcon className="h-4 w-4" />
      <span className='sr-only'>Settings</span>
    </button>
  );
};