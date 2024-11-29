import * as React from 'react';
import { QuickAction } from '../Menu';
import { LocalizationKey, localize } from '../../../localization';
import { ClipboardIcon, CodeBracketIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useRecoilState } from 'recoil';
import { SelectedItemActionAtom } from '../../state';
import { CustomScript, MediaInfo, Snippet, ViewData } from '../../../models';
import { copyToClipboard } from '../../utils';
import { parseWinPath } from '../../../helpers/parseWinPath';
import { CustomActions } from './CustomActions';

export interface IFooterActionsProps {
  media: MediaInfo;
  snippets: Snippet[];
  relPath?: string;
  viewData?: ViewData | undefined
  scripts?: CustomScript[];
  insertIntoArticle: () => void;
  insertSnippet: () => void;
  onDelete: () => void;
}

export const FooterActions: React.FunctionComponent<IFooterActionsProps> = ({
  relPath,
  media,
  snippets,
  viewData,
  scripts,
  insertIntoArticle,
  insertSnippet,
  onDelete,
}: React.PropsWithChildren<IFooterActionsProps>) => {
  const [, setSelectedItemAction] = useRecoilState(SelectedItemActionAtom);

  return (
    <div className={`py-2 w-full flex items-center justify-evenly border-t border-t-[var(--frontmatter-border)] bg-[var(--frontmatter-sideBar-background)] group-hover:bg-[var(--vscode-list-hoverBackground)]`}>
      <QuickAction
        title={localize(LocalizationKey.dashboardMediaItemMenuItemView)}
        className={`text-[var(--frontmatter-secondary-text)]`}
        onClick={() => setSelectedItemAction({
          path: media.fsPath,
          action: 'view'
        })}>
        <EyeIcon className={`w-4 h-4`} aria-hidden="true" />
        <span className='sr-only'>{localize(LocalizationKey.dashboardMediaItemMenuItemView)}</span>
      </QuickAction>

      <QuickAction
        title={localize(LocalizationKey.dashboardMediaItemMenuItemEditMetadata)}
        className={`text-[var(--frontmatter-secondary-text)]`}
        onClick={() => setSelectedItemAction({
          path: media.fsPath,
          action: 'edit'
        })}>
        <PencilIcon className={`w-4 h-4`} aria-hidden="true" />
        <span className='sr-only'>{localize(LocalizationKey.dashboardMediaItemMenuItemEditMetadata)}</span>
      </QuickAction>

      {viewData?.filePath ? (
        <>
          <QuickAction
            title={
              viewData.metadataInsert && viewData.fieldName
                ? localize(LocalizationKey.dashboardMediaItemQuickActionInsertField, viewData.fieldName)
                : localize(LocalizationKey.dashboardMediaItemQuickActionInsertMarkdown)
            }
            className={`text-[var(--frontmatter-secondary-text)]`}
            onClick={insertIntoArticle}
          >
            <PlusIcon className={`w-4 h-4`} aria-hidden="true" />
          </QuickAction>

          {viewData?.position && snippets.length > 0 && (
            <QuickAction
              title={localize(LocalizationKey.commonInsertSnippet)}
              className={`text-[var(--frontmatter-secondary-text)]`}
              onClick={insertSnippet}>
              <CodeBracketIcon className={`w-4 h-4`} aria-hidden="true" />
            </QuickAction>
          )}
        </>
      ) : (
        <>
          {
            relPath && (
              <QuickAction
                title={localize(LocalizationKey.dashboardMediaItemQuickActionCopyPath)}
                className={`text-[var(--frontmatter-secondary-text)]`}
                onClick={() => copyToClipboard(parseWinPath(relPath) || '')}>
                <ClipboardIcon className={`w-4 h-4`} aria-hidden="true" />
              </QuickAction>
            )
          }
        </>
      )}

      <CustomActions
        filePath={media.fsPath}
        scripts={scripts}
        showTrigger />

      <QuickAction
        title={localize(LocalizationKey.dashboardMediaItemQuickActionDelete)}
        className={`text-[var(--frontmatter-secondary-text)] hover:text-[var(--vscode-statusBarItem-errorBackground)]`}
        onClick={onDelete}>
        <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
      </QuickAction>
    </div>
  );
};