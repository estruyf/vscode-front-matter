import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { QuickAction } from '../Menu';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useCallback } from 'react';
import { openFile } from '../../utils/MessageHandlers';

export interface IFooterActionsProps {
  insertEnabled: boolean;
  sourcePath?: string;
  onEdit?: () => void;
  onInsert: () => void;
  onDelete?: () => void;
}

export const FooterActions: React.FunctionComponent<IFooterActionsProps> = ({
  insertEnabled,
  sourcePath,
  onEdit,
  onInsert,
  onDelete,
}: React.PropsWithChildren<IFooterActionsProps>) => {

  const showFile = useCallback(() => {
    openFile(sourcePath);
  }, [sourcePath]);

  if (!onEdit && !onDelete && !sourcePath && !insertEnabled) {
    return null;
  }

  return (
    <div className={`py-2 w-full flex items-center justify-evenly border-t border-t-[var(--frontmatter-border)] bg-[var(--frontmatter-sideBar-background)] group-hover:bg-[var(--vscode-list-hoverBackground)] z-50`}>
      {insertEnabled && (
        <QuickAction
          title={l10n.t(LocalizationKey.commonInsertSnippet)}
          className={`text-[var(--frontmatter-secondary-text)]`}
          onClick={onInsert}>
          <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
          <span className='sr-only'>{l10n.t(LocalizationKey.commonInsertSnippet)}</span>
        </QuickAction>
      )}

      {
        !sourcePath ? (
          <>
            {
              onEdit && (
                <QuickAction
                  title={l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionEditSnippet)}
                  className={`text-[var(--frontmatter-secondary-text)]`}
                  onClick={onEdit}>
                  <PencilIcon className={`w-4 h-4`} aria-hidden="true" />
                  <span className='sr-only'>{l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionEditSnippet)}</span>
                </QuickAction>
              )
            }

            {
              onDelete && (
                <QuickAction
                  title={l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionDeleteSnippet)}
                  className={`text-[var(--frontmatter-secondary-text)] hover:text-[var(--vscode-statusBarItem-errorBackground)]`}
                  onClick={onDelete}>
                  <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
                  <span className='sr-only'>{l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionDeleteSnippet)}</span>
                </QuickAction>
              )
            }
          </>
        ) : (
          <QuickAction
            title={l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionViewSnippet)}
            className={`text-[var(--frontmatter-secondary-text)]`}
            onClick={showFile}>
            <EyeIcon className={`w-4 h-4`} aria-hidden="true" />
            <span className='sr-only'>{l10n.t(LocalizationKey.dashboardSnippetsViewItemQuickActionViewSnippet)}</span>
          </QuickAction>
        )
      }
    </div >
  );
};