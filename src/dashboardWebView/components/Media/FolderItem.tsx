import { FolderIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { basename, join } from 'path';
import * as React from 'react';
import { LocalizationKey, localize } from '../../../localization';
import useMediaFolder from '../../hooks/useMediaFolder';
import { QuickAction } from '../Menu';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { useState } from 'react';
import { Alert } from '../Modals/Alert';
import { parseWinPath } from '../../../helpers/parseWinPath';

export interface IFolderItemProps {
  folder: string;
  wsFolder?: string;
  staticFolder?: string;
}

export const FolderItem: React.FunctionComponent<IFolderItemProps> = ({
  folder,
  wsFolder,
  staticFolder
}: React.PropsWithChildren<IFolderItemProps>) => {
  const { updateFolder } = useMediaFolder();
  const [showAlert, setShowAlert] = useState(false);

  const relFolderPath = wsFolder ? folder.replace(wsFolder, '') : folder;

  const isContentFolder = React.useMemo(
    () => !relFolderPath.includes(join('/', staticFolder || '', '/')),
    [relFolderPath, staticFolder]
  );

  const updateFolderName = React.useCallback(() => {
    messageHandler.send(DashboardMessage.updateMediaFolder, { folder, wsFolder, staticFolder })
  }, []);

  const onDelete = React.useCallback(() => {
    setShowAlert(true);
  }, []);

  const confirmDeletion = React.useCallback(() => {
    messageHandler.send(DashboardMessage.deleteMediaFolder, { folder });
    setShowAlert(false);
  }, [folder]);

  return (
    <>
      <li
        className={`flex flex-col group relative text-[var(--vscode-sideBarTitle-foreground)] hover:text-[var(--vscode-list-activeSelectionForeground)] shadow-md hover:shadow-xl dark:shadow-none bg-[var(--vscode-sideBar-background)] hover:bg-[var(--vscode-list-hoverBackground)] border border-[var(--frontmatter-border)] rounded`}
      >
        <button
          title={isContentFolder ? localize(LocalizationKey.dashboardMediaFolderItemContentDirectory) : localize(LocalizationKey.dashboardMediaFolderItemPublicDirectory)}
          className={`p-4 w-full flex flex-row items-center h-full`}
          onClick={() => updateFolder(folder)}
        >
          <div className="relative mr-4">
            <FolderIcon className={`h-12 w-12`} />
            {isContentFolder && (
              <span className={`font-extrabold absolute bottom-3 left-1/2 transform -translate-x-1/2 text-[var(--frontmatter-text)]`}>
                C
              </span>
            )}
          </div>

          <p className="text-sm font-bold pointer-events-none flex items-center text-left overflow-hidden break-words">
            {basename(relFolderPath)}
          </p>
        </button>

        {!isContentFolder && (
          <div className={`py-2 w-full flex items-center justify-evenly border-t border-t-[var(--frontmatter-border)] bg-[var(--frontmatter-sideBar-background)] group-hover:bg-[var(--vscode-list-hoverBackground)]`}>
            <QuickAction
              title={localize(LocalizationKey.commonEdit)}
              className={`text-[var(--frontmatter-secondary-text)]`}
              onClick={updateFolderName}>
              <PencilIcon className={`w-4 h-4`} aria-hidden="true" />
              <span className='sr-only'>{localize(LocalizationKey.dashboardMediaItemMenuItemView)}</span>
            </QuickAction>

            <QuickAction
              title={localize(LocalizationKey.dashboardMediaItemQuickActionDelete)}
              className={`text-[var(--frontmatter-secondary-text)] hover:text-[var(--vscode-statusBarItem-errorBackground)]`}
              onClick={onDelete}>
              <TrashIcon className={`w-4 h-4`} aria-hidden="true" />
            </QuickAction>
          </div>
        )}
      </li>

      {showAlert && (
        <Alert
          title={`${localize(LocalizationKey.commonDelete)}: ${basename(parseWinPath(folder) || '')}`}
          description={localize(LocalizationKey.dashboardMediaFolderItemDeleteDescription, folder)}
          okBtnText={localize(LocalizationKey.commonDelete)}
          cancelBtnText={localize(LocalizationKey.commonCancel)}
          dismiss={() => setShowAlert(false)}
          trigger={confirmDeletion}
        />
      )}
    </>
  );
};
