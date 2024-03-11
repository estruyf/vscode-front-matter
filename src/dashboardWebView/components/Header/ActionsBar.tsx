import * as React from 'react';
import { NavigationType } from '../../models';
import { CommandLineIcon, PencilIcon, TrashIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MultiSelectedItemsAtom, SelectedItemActionAtom, SelectedMediaFolderSelector, SettingsSelector } from '../../state';
import { ActionsBarItem } from './ActionsBarItem';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { Alert } from '../Modals/Alert';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { CustomScript, ScriptType } from '../../../models';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';

export interface IActionsBarProps {
  view: NavigationType;
}

export const ActionsBar: React.FunctionComponent<IActionsBarProps> = ({
  view
}: React.PropsWithChildren<IActionsBarProps>) => {
  const [selectedFiles, setSelectedFiles] = useRecoilState(MultiSelectedItemsAtom);
  const [, setSelectedItemAction] = useRecoilState(SelectedItemActionAtom);
  const [showAlert, setShowAlert] = React.useState(false);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const settings = useRecoilValue(SettingsSelector);

  const onDeleteConfirm = React.useCallback(() => {
    for (const file of selectedFiles) {
      if (file) {
        if (view === NavigationType.Contents) {
          messageHandler.send(DashboardMessage.deleteFile, file);
        } else if (view === NavigationType.Media) {
          messageHandler.send(DashboardMessage.deleteMedia, {
            file: file,
            folder: selectedFolder
          });
        }
      }
    }
    setSelectedFiles([]);
    setShowAlert(false);
  }, [selectedFiles]);

  const runCustomScript = React.useCallback((script: CustomScript) => {
    for (const file of selectedFiles) {
      messageHandler.send(DashboardMessage.runCustomScript, {
        script,
        path: file
      });
    }

    setSelectedFiles([]);
  }, [selectedFiles]);

  const customScriptActions = React.useMemo(() => {
    if (!settings?.scripts) {
      return null;
    }

    const { scripts } = settings;
    if (view === NavigationType.Media) {
      const mediaScripts = (scripts || [])
        .filter((script) => script.type === ScriptType.MediaFile && !script.hidden);

      if (mediaScripts.length > 0) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              className='flex items-center text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] disabled:opacity-50 disabled:hover:text-[var(--vscode-tab-inactiveForeground)]'
              disabled={selectedFiles.length === 0}
            >
              <CommandLineIcon className="mr-2 h-4 w-4" aria-hidden={true} />
              <span>Scripts</span>
              <ChevronDownIcon className="ml-2 h-4 w-4" aria-hidden={true} />
            </DropdownMenuTrigger>

            <DropdownMenuContent align='start'>
              {
                mediaScripts.map((script) => (
                  <DropdownMenuItem
                    key={script.id || script.title}
                    onClick={() => runCustomScript(script)}
                  >
                    <CommandLineIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                    <span>{script.title}</span>
                  </DropdownMenuItem>
                ))
              }
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }

    return null;
  }, [view, settings?.scripts, selectedFiles]);

  return (
    <>
      <div
        className={`w-full flex items-center justify-between py-2 px-4 border-b bg-[var(--vscode-sideBar-background)] text-[var(--vscode-sideBar-foreground)] border-[var(--frontmatter-border)]`}
        aria-label="Item actions"
      >
        {
          view === NavigationType.Media && (
            <div className='flex items-center space-x-6'>
              <ActionsBarItem
                disabled={selectedFiles.length === 0 || selectedFiles.length > 1}
                onClick={() => setSelectedItemAction({
                  path: selectedFiles[0],
                  action: 'edit'
                })}
              >
                <PencilIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>{l10n.t(LocalizationKey.commonEdit)}</span>
              </ActionsBarItem>

              {customScriptActions}

              <ActionsBarItem
                className='hover:text-[var(--vscode-statusBarItem-errorBackground)]'
                disabled={selectedFiles.length === 0}
                onClick={() => setShowAlert(true)}
              >
                <TrashIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>{l10n.t(LocalizationKey.commonDelete)}</span>
              </ActionsBarItem>
            </div>
          )
        }

        {
          selectedFiles.length > 0 && (
            <button
              type="button"
              className='flex items-center hover:text-[var(--vscode-statusBarItem-warningBackground)]'
              onClick={() => setSelectedFiles([])}
            >
              <XMarkIcon className="w-4 h-4 mr-1" aria-hidden="true" />
              <span>{selectedFiles.length} selected</span>
            </button>
          )
        }
      </div>

      {showAlert && (
        <Alert
          title={`${l10n.t(LocalizationKey.commonDelete)}`}
          description={`Are you sure you want to delete the selected files?`}
          okBtnText={l10n.t(LocalizationKey.commonDelete)}
          cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
          dismiss={() => setShowAlert(false)}
          trigger={onDeleteConfirm}
        />
      )}
    </>
  );
};