import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { ArrowDownTrayIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { GeneralCommands } from '../../../constants';
import { PanelSettings } from '../../../models';
import { ActionButton } from '../ActionButton';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { BranchIcon } from '../Icons/BranchIcon';

export interface IGitActionProps {
  settings: PanelSettings | undefined;
}

export const GitAction: React.FunctionComponent<IGitActionProps> = ({
  settings
}: React.PropsWithChildren<IGitActionProps>) => {
  const [commitMessage, setCommitMessage] = useState<string | undefined>(undefined);
  const [crntBanch, setCrntBranch] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState<"syncing" | "fetching" | "idle">("idle");

  const sync = () => {
    Messenger.send(GeneralCommands.toVSCode.git.sync, commitMessage);
  };

  const fetch = () => {
    Messenger.send(GeneralCommands.toVSCode.git.fetch);
  };

  const selectBranch = () => {
    messageHandler.send(GeneralCommands.toVSCode.git.selectBranch)
  }

  const messageListener = (message: MessageEvent<EventData<any>>) => {
    const { command, payload } = message.data;

    if (command === GeneralCommands.toWebview.git.syncingStart) {
      setIsSyncing(payload || "syncing");
    } else if (command === GeneralCommands.toWebview.git.syncingStart) {
      setIsSyncing("syncing");
    } else if (command === GeneralCommands.toWebview.git.syncingEnd) {
      setCommitMessage(undefined);
      setIsSyncing("idle");
    } else if (command === GeneralCommands.toWebview.git.branchName) {
      setCrntBranch(payload || undefined);
    }
  };

  const isCommitRequired = React.useMemo(() => {
    const requiresCommitMessage = settings?.git?.requiresCommitMessage || [];

    if (!crntBanch) {
      return {};
    }

    if (requiresCommitMessage && requiresCommitMessage.includes(crntBanch) && !commitMessage) {
      return {
        border: '1px solid var(--vscode-inputValidation-errorBorder)'
      };
    }

    return {};
  }, [settings?.git?.requiresCommitMessage, crntBanch, commitMessage])

  const isCommitDisabed = React.useMemo(() => {
    const disabledBranches = settings?.git?.disabledBranches || [];

    if (!crntBanch) {
      return true;
    }

    if (disabledBranches && disabledBranches.includes(crntBanch)) {
      return true;
    }

    return false;
  }, [settings?.git?.disabledBranches, crntBanch, commitMessage])

  const isSyncDisabled = React.useMemo(() => {
    const disabledBranches = settings?.git?.disabledBranches || [];
    const requiresCommitMessage = settings?.git?.requiresCommitMessage || [];

    if (!crntBanch) {
      return true;
    }

    if (disabledBranches && disabledBranches.includes(crntBanch)) {
      return true;
    }

    if (requiresCommitMessage && requiresCommitMessage.includes(crntBanch)) {
      return !commitMessage;
    }

    return false;
  }, [settings?.git?.disabledBranches, settings?.git?.requiresCommitMessage, crntBanch, commitMessage])

  useEffect(() => {
    Messenger.listen(messageListener);

    return () => {
      Messenger.unlisten(messageListener);
    };
  }, []);

  useEffect(() => {
    messageHandler.request<string>(GeneralCommands.toVSCode.git.getBranch).then((branch) => {
      setCrntBranch(branch);
    });
  }, []);

  if (!settings?.git?.actions || !settings?.git.isGitRepo) {
    return null;
  }

  return (
    <div className="git_actions">
      <h2 className='text-[11px] flex justify-between items-center mb-4'>
        <span className='uppercase'>
          Changes
        </span>

        <button
          className='inline-flex items-center w-auto p-0 bg-inherit text-[var(--vscode-sideBarTitle-foreground)] hover:bg-inherit hover:text-[var(--vscode-sideBarTitle-foreground-hover)]'
          title='Select Branch'
          onClick={selectBranch}>
          <BranchIcon className='w-4 h-4' />
          <span className='ml-1'>{crntBanch}</span>
        </button>
      </h2>

      <div className='space-y-4'>
        <input
          type='text'
          className='rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
          placeholder='Commit message'
          style={{
            ...isCommitRequired
          }}
          value={commitMessage || ''}
          onChange={(e) => setCommitMessage(e.target.value)}
          disabled={isCommitDisabed}
        />

        <ActionButton
          disabled={isSyncDisabled || isSyncing !== "idle"}
          onClick={sync}
          title={
            <div className="git_actions__sync">
              <ArrowPathIcon className={isSyncing === "syncing" ? 'animate-spin' : ''} />
              <span>
                {l10n.t(LocalizationKey.commonSync)}
              </span>
            </div>
          }
        />

        <ActionButton
          disabled={isSyncing !== "idle"}
          onClick={fetch}
          title={
            <div className="git_actions__fetch">
              <ArrowDownTrayIcon className={isSyncing === "fetching" ? 'animate-bounce' : ''} />
              <span>
                Fetch
              </span>
            </div>
          }
        />
      </div>
    </div>
  );
};
