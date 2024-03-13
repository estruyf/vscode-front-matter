import { FolderIcon } from '@heroicons/react/24/solid';
import { basename, join } from 'path';
import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import useMediaFolder from '../../hooks/useMediaFolder';

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

  const relFolderPath = wsFolder ? folder.replace(wsFolder, '') : folder;

  const isContentFolder = React.useMemo(
    () => !relFolderPath.includes(join('/', staticFolder || '', '/')),
    [relFolderPath, staticFolder]
  );

  return (
    <li
      className={`group relative hover:bg-[var(--vscode-list-hoverBackground)] text-[var(--vscode-editor-foreground)] hover:text-[var(--vscode-list-activeSelectionForeground)]`}
    >
      <button
        title={isContentFolder ? l10n.t(LocalizationKey.dashboardMediaFolderItemContentDirectory) : l10n.t(LocalizationKey.dashboardMediaFolderItemPublicDirectory)}
        className={`p-4 w-full flex flex-row items-center h-full`}
        onClick={() => updateFolder(folder)}
      >
        <div className="relative mr-4">
          <FolderIcon className={`h-12 w-12`} />
          {isContentFolder && (
            <span className={`font-extrabold absolute bottom-3 left-1/2 transform -translate-x-1/2 text-[var(--vscode-foreground)]`}>
              C
            </span>
          )}
        </div>

        <p className="text-sm font-bold pointer-events-none flex items-center text-left overflow-hidden break-words">
          {basename(relFolderPath)}
        </p>
      </button>
    </li>
  );
};
