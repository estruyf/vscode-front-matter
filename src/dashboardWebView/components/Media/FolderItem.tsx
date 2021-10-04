import { FolderIcon } from '@heroicons/react/solid';
import { basename } from 'path';
import * as React from 'react';
import { useRecoilState } from 'recoil';
import { SelectedMediaFolderAtom } from '../../state';

export interface IFolderItemProps {
  folder: string;
  wsFolder?: string;
  staticFolder?: string;
}

export const FolderItem: React.FunctionComponent<IFolderItemProps> = ({ folder, wsFolder, staticFolder }: React.PropsWithChildren<IFolderItemProps>) => {
  const [ , setSelectedFolder ] = useRecoilState(SelectedMediaFolderAtom);

  const relFolderPath = wsFolder ? folder.replace(wsFolder, '') : folder;
  
  return (
    <li className={`group relative bg-gray-200 dark:bg-vulcan-300 hover:shadow-xl dark:hover:bg-vulcan-100 text-gray-600 hover:text-gray-700 dark:text-whisper-900 dark:hover:text-whisper-800 p-4`}>
      <button className={`w-full flex flex-col items-center`} onClick={() => setSelectedFolder(folder)}>
        <FolderIcon className={`h-auto w-1/2`} />

        <p className="text-sm font-bold pointer-events-none flex items-center">
          {basename(relFolderPath)}
        </p>
      </button>
    </li>
  );
};