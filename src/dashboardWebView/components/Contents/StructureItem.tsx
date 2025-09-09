import { useRecoilValue } from 'recoil';
import { MarkdownIcon } from '../../../panelWebView/components/Icons/MarkdownIcon';
import { Page } from '../../models/Page';
import { SettingsSelector } from '../../state';
import { DateField } from '../Common/DateField';
import { ContentActions } from './ContentActions';
import { useMemo } from 'react';
import { Status } from './Status';
import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import useCard from '../../hooks/useCard';
import { ItemSelection } from '../Common/ItemSelection';
import { openFile } from '../../utils';
import useSelectedItems from '../../hooks/useSelectedItems';
import { cn } from '../../../utils/cn';

export interface IStructureItemProps extends Page { }

export const StructureItem: React.FunctionComponent<IStructureItemProps> = ({
  ...pageData
}: React.PropsWithChildren<IStructureItemProps>) => {
  const { selectedFiles } = useSelectedItems();
  const settings = useRecoilValue(SettingsSelector);
  const draftField = useMemo(() => settings?.draftField, [settings]);
  const { escapedTitle } = useCard(pageData, settings?.dashboardState?.contents?.cardFields);

  const isSelected = useMemo(() => selectedFiles.includes(pageData.fmFilePath), [selectedFiles, pageData.fmFilePath]);

  const onOpenFile = React.useCallback(() => {
    openFile(pageData.fmFilePath);
  }, [pageData.fmFilePath]);

  return (
    <div className="relative">
      <div
        className={cn(
          `flex items-center space-x-3 py-1 px-2 rounded cursor-pointer hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-editor-foreground)]`,
          isSelected && `bg-[var(--vscode-list-activeSelectionBackground)]`
        )}
      >
        <ItemSelection filePath={pageData.fmFilePath} show />
        
        <MarkdownIcon className="w-4 h-4 text-[var(--vscode-symbolIcon-fileForeground)] flex-shrink-0" />
        
        <button
          title={escapedTitle ? l10n.t(LocalizationKey.commonOpenWithValue, escapedTitle) : l10n.t(LocalizationKey.commonOpen)}
          onClick={onOpenFile}
          className="flex-1 text-left truncate font-medium"
        >
          {escapedTitle}
        </button>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {pageData.date && (
            <DateField 
              value={pageData.date} 
              format={pageData.fmDateFormat}
              className="text-xs text-[var(--vscode-descriptionForeground)]"
            />
          )}
          
          {draftField && draftField.name && typeof pageData[draftField.name] !== "undefined" && (
            <Status draft={pageData[draftField.name]} published={pageData.fmPublished} />
          )}

          <ContentActions
            path={pageData.fmFilePath}
            relPath={pageData.fmRelFileWsPath}
            contentType={pageData.fmContentType}
            scripts={settings?.scripts}
            onOpen={onOpenFile}
            listView
          />
        </div>
      </div>
    </div>
  );
};