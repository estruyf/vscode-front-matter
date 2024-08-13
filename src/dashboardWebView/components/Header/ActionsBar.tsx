import * as React from 'react';
import { NavigationType, Page } from '../../models';
import { CommandLineIcon, PencilIcon, TrashIcon, ChevronDownIcon, XMarkIcon, EyeIcon, LanguageIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MultiSelectedItemsAtom, PagedItems, SelectedItemActionAtom, SelectedMediaFolderSelector, SettingsSelector } from '../../state';
import { ActionsBarItem } from './ActionsBarItem';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { Alert } from '../Modals/Alert';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { CustomScript, ScriptType } from '../../../models';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { useFilesContext } from '../../providers/FilesProvider';
import { COMMAND_NAME, GeneralCommands } from '../../../constants';
import { RenameIcon } from '../../../components/icons/RenameIcon';
import { openFile } from '../../utils';

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
  const { files } = useFilesContext();
  const pagedItems = useRecoilValue(PagedItems);

  const viewFile = React.useCallback(() => {
    if (selectedFiles.length === 1) {
      if (view === NavigationType.Contents) {
        openFile(selectedFiles[0]);
      } else if (view === NavigationType.Media) {
        setSelectedItemAction({ path: selectedFiles[0], action: 'view' })
      }
    }
  }, [selectedFiles]);

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
  }, [selectedFiles]);

  const selectAllItems = React.useCallback(() => {
    setSelectedFiles([...pagedItems]);
  }, [pagedItems]);

  const languageActions = React.useMemo(() => {
    const actions: React.ReactNode[] = [];

    if (view === NavigationType.Contents && files.length > 0 && selectedFiles.length === 1) {
      const selectedItem = selectedFiles[0];
      const page = ((files || []) as Page[]).find((f: Page) => f.fmFilePath === selectedItem);

      if (page?.fmLocale) {
        const locale = page.fmLocale;
        const translations = page.fmTranslations;

        actions.push(
          <ActionsBarItem
            key="translate"
            onClick={() => {
              messageHandler.send(GeneralCommands.toVSCode.runCommand, {
                command: COMMAND_NAME.i18n.create,
                args: selectedItem
              })
            }}>
            <LanguageIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
            <span>{l10n.t(LocalizationKey.commonTranslate)}</span>
          </ActionsBarItem>
        )

        if (translations && Object.keys(translations).length > 0) {
          const crntLocale = translations[locale.locale];
          const otherLocales = Object.entries(translations).filter(([key]) => key !== locale.locale);

          if (otherLocales.length > 0) {
            actions.push(
              <DropdownMenu>
                <DropdownMenuTrigger
                  className='flex items-center text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)]'
                >
                  <LanguageIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                  <span>{l10n.t(LocalizationKey.commonLanguages)}</span>
                  <ChevronDownIcon className="ml-2 h-4 w-4" aria-hidden={true} />
                </DropdownMenuTrigger>

                <DropdownMenuContent align='start'>

                  <DropdownMenuItem onClick={() => openFile(crntLocale.path)}>
                    <span>{crntLocale.locale.title || crntLocale.locale.locale}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {
                    otherLocales.map(([key, value]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => openFile(value.path)}
                      >
                        <span>{value.locale.title || value.locale.locale}</span>
                      </DropdownMenuItem>
                    ))
                  }
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
        }
      }
    }

    return actions;
  }, [files, selectedFiles]);

  const customScriptActions = React.useMemo(() => {
    if (!settings?.scripts) {
      return null;
    }

    const { scripts } = settings;
    let crntScripts: CustomScript[] = [];
    if (view === NavigationType.Contents) {
      crntScripts = (scripts || [])
        .filter((script) => (script.type === undefined || script.type === ScriptType.Content) && !script.bulk && !script.hidden);
    } else if (view === NavigationType.Media) {
      crntScripts = (scripts || [])
        .filter((script) => script.type === ScriptType.MediaFile && !script.hidden);
    }

    if (crntScripts.length > 0) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className='flex items-center text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] disabled:opacity-50 disabled:hover:text-[var(--vscode-tab-inactiveForeground)]'
            disabled={selectedFiles.length === 0}
          >
            <CommandLineIcon className="mr-2 h-4 w-4" aria-hidden={true} />
            <span>{l10n.t(LocalizationKey.commonScripts)}</span>
            <ChevronDownIcon className="ml-2 h-4 w-4" aria-hidden={true} />
          </DropdownMenuTrigger>

          <DropdownMenuContent align='start'>
            {
              crntScripts.map((script) => (
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
      );
    }

    return null;
  }, [view, settings?.scripts, selectedFiles]);

  return (
    <>
      <div
        className={`w-full flex items-center justify-between py-2 px-4 border-b bg-[var(--vscode-sideBar-background)] text-[var(--vscode-sideBar-foreground)] border-[var(--frontmatter-border)]`}
        aria-label="Item actions"
      >
        <div className='flex items-center space-x-6'>
          <ActionsBarItem
            disabled={selectedFiles.length === 0 || selectedFiles.length > 1}
            onClick={viewFile}
            title={l10n.t(LocalizationKey.commonView)}
          >
            <EyeIcon className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>{l10n.t(LocalizationKey.commonView)}</span>
          </ActionsBarItem>

          {
            view === NavigationType.Contents && (
              <ActionsBarItem
                disabled={selectedFiles.length === 0 || selectedFiles.length > 1}
                onClick={() => {
                  messageHandler.send(DashboardMessage.rename, selectedFiles[0]);
                  setSelectedFiles([]);
                }}
                title={l10n.t(LocalizationKey.commonRename)}
              >
                <RenameIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>{l10n.t(LocalizationKey.commonRename)}</span>
              </ActionsBarItem>
            )
          }

          {
            view === NavigationType.Media && (
              <>
                <ActionsBarItem
                  disabled={selectedFiles.length === 0 || selectedFiles.length > 1}
                  onClick={() => setSelectedItemAction({
                    path: selectedFiles[0],
                    action: 'edit'
                  })}
                  title={l10n.t(LocalizationKey.commonEdit)}
                >
                  <PencilIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>{l10n.t(LocalizationKey.commonEdit)}</span>
                </ActionsBarItem>
              </>
            )
          }

          {languageActions}

          {customScriptActions}

          <ActionsBarItem
            className='hover:text-[var(--vscode-statusBarItem-errorBackground)]'
            disabled={selectedFiles.length === 0}
            onClick={() => setShowAlert(true)}
            title={l10n.t(LocalizationKey.commonDelete)}
          >
            <TrashIcon className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>{l10n.t(LocalizationKey.commonDelete)}</span>
          </ActionsBarItem>
        </div>

        <div className='flex gap-4'>
          {
            selectedFiles.length > 0 && (
              <ActionsBarItem
                className='flex items-center hover:text-[var(--vscode-statusBarItem-warningBackground)]'
                onClick={() => setSelectedFiles([])}
                title={l10n.t(LocalizationKey.dashboardHeaderActionsBarItemsSelected, selectedFiles.length)}
              >
                <XMarkIcon className="w-4 h-4 mr-1" aria-hidden="true" />
                <span>{l10n.t(LocalizationKey.dashboardHeaderActionsBarItemsSelected, selectedFiles.length)}</span>
              </ActionsBarItem>
            )
          }

          <ActionsBarItem
            disabled={selectedFiles.length === pagedItems.length}
            onClick={selectAllItems}
            title={l10n.t(LocalizationKey.dashboardHeaderActionsBarSelectAll)}
          >
            <div className='w-4 h-4 inline-flex items-center justify-center border border-[var(--vscode-sideBar-foreground)] group-hover:border-[var(--vscode-statusBarItem-warningBackground)] rounded mr-1'>
              <CheckIcon className="w-3 h-3" aria-hidden="true" />
            </div>
            <span>{l10n.t(LocalizationKey.dashboardHeaderActionsBarSelectAll)}</span>
          </ActionsBarItem>
        </div>
      </div >

      {showAlert && (
        <Alert
          title={`${l10n.t(LocalizationKey.dashboardHeaderActionsBarAlertDeleteTitle)}`}
          description={l10n.t(LocalizationKey.dashboardHeaderActionsBarAlertDeleteDescription)}
          okBtnText={l10n.t(LocalizationKey.commonDelete)}
          cancelBtnText={l10n.t(LocalizationKey.commonCancel)}
          dismiss={() => setShowAlert(false)}
          trigger={onDeleteConfirm}
        />
      )
      }
    </>
  );
};