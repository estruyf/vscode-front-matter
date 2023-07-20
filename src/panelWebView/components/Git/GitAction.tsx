import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { GeneralCommands } from '../../../constants';
import { PanelSettings } from '../../../models';
import { ActionButton } from '../ActionButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IGitActionProps {
  settings: PanelSettings | undefined;
}

export const GitAction: React.FunctionComponent<IGitActionProps> = ({
  settings
}: React.PropsWithChildren<IGitActionProps>) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const pull = () => {
    Messenger.send(GeneralCommands.toVSCode.gitSync);
  };

  const messageListener = (message: MessageEvent<EventData<any>>) => {
    const { command } = message.data;

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
    };
  }, []);

  if (!settings?.git?.actions || !settings?.git.isGitRepo) {
    return null;
  }

  return (
    <div className="git_actions">
      <ActionButton
        onClick={pull}
        title={
          <div className="git_actions__sync">
            <RefreshIcon className={isSyncing ? 'animate-spin' : ''} />
            <span>
              {l10n.t(LocalizationKey.commonSync)}
            </span>
          </div>
        }
      />
    </div>
  );
};
