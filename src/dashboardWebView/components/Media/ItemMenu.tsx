import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { QuickAction } from '../Menu';
import { ClipboardIcon, CodeBracketIcon, CommandLineIcon, EllipsisVerticalIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CustomScript, MediaInfo, ScriptType, Snippet, ViewData } from '../../../models';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { parseWinPath } from '../../../helpers/parseWinPath';

export interface IItemMenuProps {
  media: MediaInfo;
  relPath?: string;
  selectedFolder: string | null;
  viewData?: ViewData;
  snippets: Snippet[];
  scripts?: CustomScript[];
  insertIntoArticle: () => void;
  insertSnippet: () => void;
  showUpdateMedia: () => void;
  showMediaDetails: () => void;
  processSnippet: (snippet: Snippet) => void;
  onDelete: () => void;
}

export const ItemMenu: React.FunctionComponent<IItemMenuProps> = ({
  media,
  relPath,
  selectedFolder,
  viewData,
  snippets,
  scripts,
  insertIntoArticle,
  insertSnippet,
  showUpdateMedia,
  showMediaDetails,
  processSnippet,
  onDelete,
}: React.PropsWithChildren<IItemMenuProps>) => {

  const copyToClipboard = React.useCallback(() => {
    if (relPath) {
      messageHandler.send(DashboardMessage.copyToClipboard, parseWinPath(relPath) || '');
    }
  }, [relPath]);

  const runCustomScript = React.useCallback((script: CustomScript) => {
    messageHandler.send(DashboardMessage.runCustomScript, {
      script,
      path: media.fsPath
    });
  }, [media]);

  const revealMedia = React.useCallback(() => {
    messageHandler.send(DashboardMessage.revealMedia, {
      file: media.fsPath,
      folder: selectedFolder
    });
  }, [selectedFolder]);

  const customScriptActions = React.useMemo(() => {
    return (scripts || [])
      .filter((script) => script.type === ScriptType.MediaFile && !script.hidden)
      .map((script) => (
        <DropdownMenuItem
          key={script.title}
          onClick={() => runCustomScript(script)}
        >
          <CommandLineIcon className="mr-2 h-4 w-4" aria-hidden={true} />
          <span>{script.title}</span>
        </DropdownMenuItem>
      ));
  }, [scripts]);

  return (
    <div className={`group/actions absolute top-4 right-4 flex flex-col space-y-4`}>
      <div className={`flex items-center border border-transparent rounded-full p-2 -mr-2 -mt-2 group-hover/actions:bg-[var(--vscode-sideBar-background)] group-hover/actions:border-[var(--frontmatter-border)]`}>
        <div className="relative z-10 flex text-left">
          <div className="hidden group-hover/actions:flex">
            <QuickAction title={l10n.t(LocalizationKey.dashboardMediaItemMenuItemView)} onClick={showMediaDetails}>
              <EyeIcon className={`w-4 h-4`} aria-hidden="true" />
              <span className='sr-only'>{l10n.t(LocalizationKey.dashboardMediaItemMenuItemView)}</span>
            </QuickAction>

            <QuickAction title={l10n.t(LocalizationKey.dashboardMediaItemMenuItemEditMetadata)} onClick={showUpdateMedia}>
              <PencilIcon className={`w-4 h-4`} aria-hidden="true" />
              <span className='sr-only'>{l10n.t(LocalizationKey.dashboardMediaItemMenuItemEditMetadata)}</span>
            </QuickAction>

            {viewData?.filePath ? (
              <>
                <QuickAction
                  title={
                    viewData.metadataInsert && viewData.fieldName
                      ? l10n.t(LocalizationKey.dashboardMediaItemQuickActionInsertField, viewData.fieldName)
                      : l10n.t(LocalizationKey.dashboardMediaItemQuickActionInsertMarkdown)
                  }
                  onClick={insertIntoArticle}
                >
                  <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
                </QuickAction>

                {viewData?.position && snippets.length > 0 && (
                  <QuickAction title={l10n.t(LocalizationKey.commonInsertSnippet)} onClick={insertSnippet}>
                    <CodeBracketIcon className={`w-4 h-4`} aria-hidden="true" />
                  </QuickAction>
                )}
              </>
            ) : (
              <>
                {
                  relPath && (
                    <QuickAction title={l10n.t(LocalizationKey.dashboardMediaItemQuickActionCopyPath)} onClick={copyToClipboard}>
                      <ClipboardIcon className={`w-4 h-4`} aria-hidden="true" />
                    </QuickAction>
                  )
                }
              </>
            )}

            <QuickAction title={l10n.t(LocalizationKey.dashboardMediaItemQuickActionDelete)} onClick={onDelete}>
              <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
            </QuickAction>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className='text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)]'>
              <span className="sr-only">{l10n.t(LocalizationKey.commonMenu)}</span>
              <EllipsisVerticalIcon className="w-4 h-4" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={showUpdateMedia}>
                <PencilIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                <span>{l10n.t(LocalizationKey.dashboardMediaItemMenuItemEditMetadata)}</span>
              </DropdownMenuItem>

              {
                viewData?.filePath ? (
                  <>
                    <DropdownMenuItem onClick={insertIntoArticle}>
                      <PlusIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                      <span>{l10n.t(LocalizationKey.dashboardMediaItemMenuItemInsertImage)}</span>
                    </DropdownMenuItem>

                    {
                      viewData?.position &&
                      snippets.length > 0 &&
                      snippets.map((snippet, idx) => (
                        <DropdownMenuItem key={idx} onClick={() => processSnippet(snippet)}>
                          <CodeBracketIcon
                            className="mr-2 h-4 w-4"
                            aria-hidden={true}
                          />
                          <span>{snippet.title}</span>
                        </DropdownMenuItem>
                      ))
                    }

                    {customScriptActions}
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={copyToClipboard}>
                      <ClipboardIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                      <span>{l10n.t(LocalizationKey.dashboardMediaItemQuickActionCopyPath)}</span>
                    </DropdownMenuItem>

                    {customScriptActions}
                  </>
                )
              }

              <DropdownMenuItem onClick={revealMedia}>
                <EyeIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                <span>{l10n.t(LocalizationKey.dashboardMediaItemMenuItemRevealMedia)}</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onDelete} className={`focus:bg-[var(--vscode-statusBarItem-errorBackground)] focus:text-[var(--vscode-statusBarItem-errorForeground)]`}>
                <TrashIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                <span>{l10n.t(LocalizationKey.commonDelete)}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};