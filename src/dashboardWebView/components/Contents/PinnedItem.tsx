import * as React from 'react';
import { Page } from '../../models';
import { MarkdownIcon } from '../../../panelWebView/components/Icons/MarkdownIcon';
import { ContentActions } from './ContentActions';
import { DashboardMessage } from '../../DashboardMessage';
import { messageHandler } from '@estruyf/vscode/dist/client';
import useCard from '../../hooks/useCard';
import { SettingsSelector } from '../../state';
import { useRecoilValue } from 'recoil';

export interface IPinnedItemProps extends Page { }

export const PinnedItem: React.FunctionComponent<IPinnedItemProps> = ({
  ...pageData
}: React.PropsWithChildren<IPinnedItemProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const { escapedTitle } = useCard(pageData, settings?.dashboardState?.contents?.cardFields);

  const openFile = React.useCallback(() => {
    messageHandler.send(DashboardMessage.openFile, pageData.fmFilePath);
  }, [pageData.fmFilePath]);

  return (
    <li className='group flex w-full border border-[var(--frontmatter-border)] rounded bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-sideBarTitle-foreground)]'>
      <button onClick={openFile} className='relative h-full w-1/3'>
        {
          pageData["fmPreviewImage"] ? (
            <img
              src={`${pageData["fmPreviewImage"]}`}
              alt={pageData.title || ""}
              className="absolute inset-0 h-full w-full object-left-top object-cover group-hover:brightness-75"
              loading="lazy"
            />
          ) : (
            <div
              className={`h-full flex items-center justify-center bg-[var(--vscode-sideBar-background)] group-hover:bg-[var(--vscode-list-hoverBackground)] border-r border-[var(--frontmatter-border)]`}
            >
              <MarkdownIcon className={`h-8 text-[var(--vscode-sideBarTitle-foreground)] opacity-80`} />
            </div>
          )
        }
      </button>

      <button onClick={openFile} className='relative w-2/3 p-4 text-left flex items-start'>
        <p className='font-bold'>{escapedTitle}</p>

        <ContentActions
          title={pageData.title}
          path={pageData.fmFilePath}
          relPath={pageData.fmRelFileWsPath}
          scripts={settings?.scripts}
          onOpen={openFile}
        />
      </button>
    </li>
  );
};