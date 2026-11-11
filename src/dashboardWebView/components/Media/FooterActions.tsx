import * as React from 'react';
import { QuickAction } from '../Menu';
import { LocalizationKey, localize } from '../../../localization';
import { ClipboardIcon, CodeBracketIcon, EyeIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useSetRecoilState } from 'recoil';
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
  onMenuOpenChange?: (open: boolean) => void;
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
  onMenuOpenChange,
}: React.PropsWithChildren<IFooterActionsProps>) => {
  const setSelectedItemAction = useSetRecoilState(SelectedItemActionAtom);

  return (
    <div className="w-full flex items-center justify-end gap-0.5 px-2 py-2 border-t border-[var(--fm-border)]">
      <QuickAction
        title={localize(LocalizationKey.dashboardMediaItemMenuItemView)}
        className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-text-mid)]`}
        onClick={() => setSelectedItemAction({
          path: media.fsPath,
          action: 'view'
        })}>
        <EyeIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
        <span className='sr-only'>{localize(LocalizationKey.dashboardMediaItemMenuItemView)}</span>
      </QuickAction>

      <QuickAction
        title={localize(LocalizationKey.dashboardMediaItemMenuItemEditMetadata)}
        className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-text-mid)]`}
        onClick={() => setSelectedItemAction({
          path: media.fsPath,
          action: 'edit'
        })}>
        <PencilIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
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
            className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-text-mid)]`}
            onClick={insertIntoArticle}
          >
            <PlusIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
          </QuickAction>

          {viewData?.position && snippets.length > 0 && (
            <QuickAction
              title={localize(LocalizationKey.commonInsertSnippet)}
              className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-text-mid)]`}
              onClick={insertSnippet}>
              <CodeBracketIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
            </QuickAction>
          )}
        </>
      ) : (
        <>
          {
            relPath && (
              <QuickAction
                title={localize(LocalizationKey.dashboardMediaItemQuickActionCopyPath)}
                className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-text-mid)]`}
                onClick={() => copyToClipboard(parseWinPath(relPath) || '')}>
                <ClipboardIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
              </QuickAction>
            )
          }
        </>
      )}

      <CustomActions
        filePath={media.fsPath}
        scripts={scripts}
        showTrigger
        onMenuOpenChange={onMenuOpenChange} />

      <QuickAction
        title={localize(LocalizationKey.dashboardMediaItemQuickActionDelete)}
        className={`text-[var(--fm-text-lo)] hover:text-[var(--fm-status-danger)]`}
        onClick={onDelete}>
        <TrashIcon className={`w-3.5 h-3.5`} aria-hidden="true" />
      </QuickAction>
    </div>
  );
};