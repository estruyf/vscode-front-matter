import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { GeneralCommands } from '../../../constants';
import { SettingsSelector } from '../../state';

export interface ISyncButtonProps {}

export const SyncButton: React.FunctionComponent<ISyncButtonProps> = (props: React.PropsWithChildren<ISyncButtonProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [ isSyncing, setIsSyncing ] = useState(false);
  
  const pull = () => {
    Messenger.send(GeneralCommands.toVSCode.gitSync);
  };

  const messageListener = (message: MessageEvent<EventData<any>>) => {
    const { command, data } = message.data;

    if (command === GeneralCommands.toWebview.gitSyncingStart) {
      setIsSyncing(true);
    } else if (command === GeneralCommands.toWebview.gitSyncingEnd) {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    Messenger.listen(messageListener);

    return () => {
      Messenger.unlisten(messageListener);
    }
  }, []);

  if (!settings?.git?.actions || !settings?.git.isGitRepo) {
    return null;
  }

  return (
    <div className='git_actions'>
       <button
        type="button"
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:bg-gray-500"
        onClick={pull}
        disabled={isSyncing}
      >
        <RefreshIcon className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-reverse-spin' : ''}`} aria-hidden="true" />
        <span>Sync</span>
      </button>
    </div>
  );
};