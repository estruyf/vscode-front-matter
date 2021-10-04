import { HomeIcon } from '@heroicons/react/solid';
import { basename, join } from 'path';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SelectedMediaFolderAtom, SettingsAtom } from '../../state';

export interface IBreadcrumbProps {}

export const Breadcrumb: React.FunctionComponent<IBreadcrumbProps> = (props: React.PropsWithChildren<IBreadcrumbProps>) => {
  const [ selectedFolder, setSelectedFolder ] = useRecoilState(SelectedMediaFolderAtom);
  const settings = useRecoilValue(SettingsAtom);
  const [ folders, setFolders ] = React.useState<string[]>([]);

  if (!settings?.wsFolder) {
    return null;
  }

  React.useEffect(() => {
    const { wsFolder, staticFolder, contentFolders } = settings;

    const isValid = (folderPath: string) => {
      if (staticFolder) {
        const staticPath = join(wsFolder, staticFolder);
        const relPath = folderPath.replace(staticPath, '');
        if (relPath.length > 1 && folderPath.startsWith(staticPath)) {
          return true;
        } else if (relPath.length === 0) {
          return false;
        }
      }

      for (let i = 0; i < contentFolders.length; i++) {
        const contentFolder = contentFolders[i];
        const relContentPath = folderPath.replace(contentFolder, '');
        return relContentPath.length > 1 && folderPath.startsWith(contentFolder);
      }

      return false;
    };

    if (!selectedFolder) {
      setFolders([]);
    } else {
      const relPath = selectedFolder.replace(settings.wsFolder, '');
      const folderParts = relPath.split('/').filter(f => f);
      const allFolders: string[] = [];
      let previousFolder = settings.wsFolder;

      for (const part of folderParts) {
        const folder = join(previousFolder, part);
        if (isValid(folder)) {
          allFolders.push(folder);
        }
        previousFolder = folder;
      }
  
      setFolders(allFolders);
    }
  }, [selectedFolder]);

  return (
    <nav className="bg-gray-200 text-vulcan-300 dark:bg-vulcan-400 dark:text-whisper-600 border-b border-gray-300 dark:border-vulcan-100 flex py-2" aria-label="Breadcrumb">
      <ol role="list" className="w-full mx-auto flex space-x-4 px-5">
        <li className="flex">
          <div className="flex items-center">
            <button onClick={() => setSelectedFolder(null)} className="text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500">
              <HomeIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </button>
          </div>
        </li>
        {folders.map((folder) => (
          <li key={folder} className="flex">
            <div className="flex items-center">
              <svg
                className="flex-shrink-0 h-5 w-5 text-gray-300 dark:text-whisper-900"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <button
                onClick={() => setSelectedFolder(folder)}
                className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500"
              >
                {basename(folder)}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};