import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { ClipboardIcon, CodeBracketIcon, EllipsisHorizontalIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CustomScript, MediaInfo, Snippet, ViewData } from '../../../models';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { copyToClipboard } from '../../utils';
import { CustomActions } from './CustomActions';

export interface IItemMenuProps {
  media: MediaInfo;
  relPath?: string;
  selectedFolder: string | null;
  viewData?: ViewData;
  snippets: Snippet[];
  scripts?: CustomScript[];
  insertIntoArticle: () => void;
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
  showUpdateMedia,
  showMediaDetails,
  processSnippet,
  onDelete,
}: React.PropsWithChildren<IItemMenuProps>) => {

  const onCopyToClipboard = React.useCallback(() => {
    copyToClipboard(parseWinPath(relPath) || '');
  }, [relPath]);

  const revealMedia = React.useCallback(() => {
    messageHandler.send(DashboardMessage.revealMedia, {
      file: media.fsPath,
      folder: selectedFolder
    });
  }, [selectedFolder]);

  return (
    <div className={`group/actions absolute top-4 right-4 flex flex-col space-y-4`}>
      <div className={`flex items-center border border-transparent rounded-full p-1 -mr-2 -mt-1 group-hover/actions:bg-[var(--vscode-sideBar-background)] group-hover/actions:border-[var(--frontmatter-border)]`}>
        <div className="relative z-10 flex text-left">
          <DropdownMenu>
            <DropdownMenuTrigger className='text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)]'>
              <span className="sr-only">{l10n.t(LocalizationKey.commonMenu)}</span>
              <EllipsisHorizontalIcon className="w-4 h-4" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={showMediaDetails}>
                <EyeIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                <span>{l10n.t(LocalizationKey.commonView)}</span>
              </DropdownMenuItem>

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
                  </>
                ) : (
                  <DropdownMenuItem onClick={onCopyToClipboard}>
                    <ClipboardIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                    <span>{l10n.t(LocalizationKey.dashboardMediaItemQuickActionCopyPath)}</span>
                  </DropdownMenuItem>
                )
              }

              <CustomActions
                filePath={media.fsPath}
                scripts={scripts} />

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