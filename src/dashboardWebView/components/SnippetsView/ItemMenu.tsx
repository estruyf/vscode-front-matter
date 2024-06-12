import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { useCallback } from 'react';
import { LocalizationKey } from '../../../localization';
import { openFile } from '../../utils/MessageHandlers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

export interface IItemMenuProps {
  insertEnabled: boolean;
  sourcePath?: string;
  onEdit?: () => void;
  onInsert: () => void;
  onDelete?: () => void;
}

export const ItemMenu: React.FunctionComponent<IItemMenuProps> = ({
  insertEnabled,
  sourcePath,
  onEdit,
  onInsert,
  onDelete,
}: React.PropsWithChildren<IItemMenuProps>) => {

  const showFile = useCallback(() => {
    openFile(sourcePath);
  }, [sourcePath]);

  if (!onEdit && !onDelete && !sourcePath && !insertEnabled) {
    return null;
  }

  return (
    <div className={`group/actions absolute top-4 right-4 flex flex-col space-y-4`}>
      <div className={`flex items-center border border-transparent rounded-full p-1 -mr-2 -mt-3 group-hover/actions:bg-[var(--vscode-sideBar-background)] group-hover/actions:border-[var(--frontmatter-border)]`}>
        <div className="relative z-10 flex text-left">
          <DropdownMenu>
            <DropdownMenuTrigger className='text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)]'>
              <span className="sr-only">{l10n.t(LocalizationKey.commonMenu)}</span>
              <EllipsisHorizontalIcon className="w-4 h-4" aria-hidden="true" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              {
                insertEnabled && (
                  <DropdownMenuItem
                    title={l10n.t(LocalizationKey.commonInsertSnippet)}
                    onClick={onInsert}>
                    <PlusIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                    <span>{l10n.t(LocalizationKey.commonInsertSnippet)}</span>
                  </DropdownMenuItem>
                )
              }

              {
                !sourcePath ? (
                  <>
                    {
                      onEdit && (
                        <DropdownMenuItem
                          title={l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionEditSnippet)}
                          onClick={onEdit}>
                          <PencilIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                          <span>{l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionEditSnippet)}</span>
                        </DropdownMenuItem>
                      )
                    }

                    {
                      onDelete && (
                        <DropdownMenuItem
                          title={l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionDeleteSnippet)}
                          onClick={onDelete}
                          className={`focus:bg-[var(--vscode-statusBarItem-errorBackground)] focus:text-[var(--vscode-statusBarItem-errorForeground)]`}>
                          <TrashIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                          <span>{l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionDeleteSnippet)}</span>
                        </DropdownMenuItem>
                      )
                    }
                  </>
                ) : (
                  <DropdownMenuItem
                    title={l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionViewSnippet)}
                    onClick={showFile}>
                    <EyeIcon className="mr-2 h-4 w-4" aria-hidden={true} />
                    <span>{l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionViewSnippet)}</span>
                  </DropdownMenuItem>
                )
              }
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};