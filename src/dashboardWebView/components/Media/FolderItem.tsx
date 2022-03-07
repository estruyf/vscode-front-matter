import {DocumentIcon, FolderIcon} from '@heroicons/react/solid';
import { basename, join } from 'path';
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

  const isContentFolder = React.useMemo(() => !relFolderPath.includes(join('/', staticFolder || '', '/')), [relFolderPath, staticFolder]);
  
  return (
    <li className={`group relative hover:bg-gray-200 dark:hover:bg-vulcan-100 text-gray-600 hover:text-gray-700 dark:text-whisper-900 dark:hover:text-whisper-800 p-4`}>
      <button title={isContentFolder ? 'Content directory folder' : 'Public directory folder'} className={`w-full flex flex-row items-center h-full`} onClick={() => setSelectedFolder(folder)}>
        <div className='relative mr-4'>
          <FolderIcon className={`h-12 w-12`} />
          {
            isContentFolder && (
              <span className='text-whisper-800 dark:text-vulcan-500 font-extrabold absolute bottom-3 left-1/2 transform -translate-x-1/2'>C</span>
            )
          }
        </div>

        <p className="text-sm font-bold pointer-events-none flex items-center text-left overflow-hidden break-words">
          {basename(relFolderPath)}
        </p>
      </button>
    </li>
  );
};