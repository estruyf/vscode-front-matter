import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { GeneralCommands } from '../../../constants';
import useThemeColors from '../../hooks/useThemeColors';
import { SettingsSelector } from '../../state';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ISyncButtonProps { }

export const SyncButton: React.FunctionComponent<ISyncButtonProps> = (
  _: React.PropsWithChildren<ISyncButtonProps>
) => {
  const settings = useRecoilValue(SettingsSelector);
  const [isSyncing, setIsSyncing] = useState(false);
  const { getColors } = useThemeColors();

  const pull = () => {
    Messenger.send(GeneralCommands.toVSCode.git.sync);
  };

  const messageListener = (message: MessageEvent<EventData<any>>) => {
    const { command } = message.data;

    if (command === GeneralCommands.toWebview.git.syncingStart) {
      setIsSyncing(true);
    } else if (command === GeneralCommands.toWebview.git.syncingEnd) {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    Messenger.listen(messageListener);

    return () => {
      Messenger.unlisten(messageListener);
    };
  }, []);

  if (!settings?.git?.actions || !settings?.git.isGitRepo) {
    return null;
  }

  return (
    <div className="git_actions">
      <button
        type="button"
        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium focus:outline-none rounded ${getColors(
          `text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500`,
          `text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`
        )
          }`}
        onClick={pull}
        disabled={isSyncing}
      >
        <ArrowPathIcon
          className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-reverse-spin' : ''}`}
          aria-hidden="true"
        />
        <span>{l10n.t(LocalizationKey.commonSync)}</span>
      </button>
    </div>
  );
};
