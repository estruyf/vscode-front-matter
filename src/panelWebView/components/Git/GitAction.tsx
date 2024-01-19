import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
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
  const [crntBanch, setCrntBranch] = useState<string | undefined>(undefined);
  const [branches, setBranches] = useState<string[] | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  const pull = () => {
    Messenger.send(GeneralCommands.toVSCode.git.sync);
  };

  const selectBranch = () => {
    messageHandler.send(GeneralCommands.toVSCode.git.selectBranch)
  }

  const messageListener = (message: MessageEvent<EventData<any>>) => {
    const { command, payload } = message.data;

    if (command === GeneralCommands.toWebview.git.syncingStart) {
      setIsSyncing(true);
    } else if (command === GeneralCommands.toWebview.git.syncingEnd) {
      setIsSyncing(false);
    } else if (command === GeneralCommands.toWebview.git.branchInfo) {
      setCrntBranch(payload.crntBranch || undefined);
      setBranches(payload.branches || undefined);
    }
  };

  const isSyncDisabled = React.useMemo(() => {
    if (!settings?.git?.disabledBranches || settings.git.disabledBranches.length === 0) {
      return false;
    }

    if (!crntBanch) {
      return true;
    }

    return settings.git.disabledBranches.includes(crntBanch);
  }, [settings?.git?.disabledBranches, crntBanch])

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
          Git Actions
        </span>

        <button
          className='inline-flex items-center w-auto p-0 bg-inherit text-[var(--vscode-sideBarTitle-foreground)] hover:bg-inherit hover:text-[var(--vscode-sideBarTitle-foreground-hover)]'
          title='Select Branch'
          onClick={selectBranch}>
          <svg width="24" height="24" viewBox="0 0 24 24" className='w-4 h-4' fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.0067 8.22168C21.0102 7.52792 20.8205 6.84689 20.4589 6.25485C20.0971 5.66281 19.5778 5.18315 18.959 4.86957C18.3401 4.556 17.6461 4.42091 16.9548 4.47941C16.2635 4.53793 15.6022 4.78773 15.0448 5.20085C14.4875 5.61397 14.0561 6.17409 13.7991 6.8185C13.5421 7.4629 13.4695 8.16613 13.5895 8.84944C13.7096 9.53274 14.0174 10.1692 14.4787 10.6874C14.94 11.2056 15.5365 11.5852 16.2012 11.7836C15.9558 12.2824 15.576 12.703 15.1047 12.9979C14.6334 13.2929 14.0892 13.4505 13.5331 13.4532H10.5437C9.43702 13.4571 8.37138 13.8727 7.55427 14.6191V7.39809C8.46159 7.21288 9.26783 6.69737 9.81668 5.95151C10.3655 5.20565 10.6178 4.28256 10.5248 3.36121C10.4317 2.43987 9.99985 1.5859 9.31292 0.964873C8.62599 0.343845 7.73295 0 6.80691 0C5.88087 0 4.98783 0.343845 4.3009 0.964873C3.61397 1.5859 3.18211 2.43987 3.08904 3.36121C2.99596 4.28256 3.24831 5.20565 3.79715 5.95151C4.34599 6.69737 5.15223 7.21288 6.05955 7.39809V16.5159C5.15393 16.6891 4.34299 17.1877 3.77969 17.9176C3.21639 18.6476 2.93968 19.5585 3.00173 20.4785C3.06379 21.3984 3.46033 22.2639 4.11656 22.9115C4.77279 23.5592 5.64335 23.9444 6.56403 23.9944C7.48472 24.0445 8.39187 23.7558 9.1144 23.183C9.83693 22.6102 10.3249 21.7928 10.4862 20.885C10.6475 19.9771 10.4712 19.0417 9.99023 18.255C9.50932 17.4683 8.75717 16.8848 7.87564 16.6145C8.12152 16.1162 8.50142 15.6963 8.97272 15.4019C9.44401 15.1074 9.98803 14.9503 10.5437 14.9479H13.5331C14.4658 14.9436 15.3739 14.6486 16.1311 14.1039C16.8882 13.5592 17.4566 12.792 17.7572 11.9091C18.6531 11.7914 19.476 11.3528 20.0735 10.6748C20.671 9.9968 21.0025 9.12533 21.0067 8.22168ZM4.56483 3.73752C4.56483 3.29408 4.69633 2.8606 4.94269 2.4919C5.18906 2.12319 5.53922 1.83581 5.9489 1.66611C6.3586 1.49642 6.8094 1.45202 7.24432 1.53854C7.67924 1.62504 8.07874 1.83857 8.3923 2.15214C8.70586 2.4657 8.9194 2.8652 9.00591 3.30012C9.09241 3.73504 9.04802 4.18585 8.87832 4.59553C8.70862 5.00521 8.42125 5.35539 8.05254 5.60175C7.68383 5.84811 7.25035 5.9796 6.80691 5.9796C6.21227 5.9796 5.642 5.74339 5.22152 5.32291C4.80105 4.90245 4.56483 4.33216 4.56483 3.73752ZM9.04899 20.1794C9.04899 20.6229 8.91749 21.0563 8.67113 21.425C8.42476 21.7937 8.0746 22.0811 7.66492 22.2508C7.25523 22.4205 6.80442 22.4649 6.36951 22.3784C5.93458 22.292 5.53509 22.0784 5.22152 21.7648C4.90796 21.4512 4.69443 21.0517 4.60791 20.6169C4.52141 20.1819 4.5658 19.7311 4.7355 19.3214C4.9052 18.9117 5.19258 18.5615 5.56128 18.3152C5.92999 18.0689 6.36347 17.9373 6.80691 17.9373C7.40155 17.9373 7.97183 18.1736 8.3923 18.594C8.81277 19.0145 9.04899 19.5848 9.04899 20.1794ZM17.2699 10.4638C16.8265 10.4638 16.393 10.3322 16.0243 10.0859C15.6556 9.83954 15.3683 9.48937 15.1986 9.07969C15.0289 8.67 14.9844 8.2192 15.0709 7.78427C15.1574 7.34935 15.3709 6.94985 15.6845 6.63629C15.9981 6.32273 16.3976 6.10919 16.8325 6.02268C17.2674 5.93617 17.7183 5.98058 18.1279 6.15027C18.5377 6.31997 18.8878 6.60734 19.1341 6.97605C19.3805 7.34476 19.512 7.77823 19.512 8.22168C19.512 8.81632 19.2757 9.3866 18.8553 9.80706C18.4348 10.2275 17.8645 10.4638 17.2699 10.4638Z" fill="currentcolor" />
          </svg>
          <span className='ml-1'>{crntBanch}</span>
        </button>
      </h2>

      <ActionButton
        disabled={isSyncDisabled}
        onClick={pull}
        title={
          <div className="git_actions__sync">
            <ArrowPathIcon className={isSyncing ? 'animate-spin' : ''} />
            <span>
              {l10n.t(LocalizationKey.commonSync)}
            </span>
          </div>
        }
      />
    </div>
  );
};
