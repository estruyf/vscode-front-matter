import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MediaTotalSelector, PageAtom, SearchAtom, SelectedMediaFolderSelector } from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { RefreshIcon } from '@heroicons/react/outline';
import { LIMIT } from '../../hooks/useMedia';

export interface IPaginationStatusProps {}

export const PaginationStatus: React.FunctionComponent<IPaginationStatusProps> = (props: React.PropsWithChildren<IPaginationStatusProps>) => {
  const totalMedia = useRecoilValue(MediaTotalSelector);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const [ page, setPage ] = useRecoilState(PageAtom);
  const [ , setSearch ] = useRecoilState(SearchAtom);

  const getTotalPage = () => {
    const mediaItems = ((page + 1) * LIMIT);
    if (totalMedia < mediaItems) {
      return totalMedia;
    }
    return mediaItems;
  };

  const refresh = () => {
    setPage(0);
    setSearch('');
    Messenger.send(DashboardMessage.refreshMedia, { folder: selectedFolder });
  }

  return (
    <div className="hidden sm:flex">
      <button className={`mr-2 text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500`}
              title="Refresh media"
              onClick={refresh}>
        <RefreshIcon className={`h-5 w-5`} />
        <span className="sr-only">Refresh media</span>
      </button>
      
      <p className="text-sm text-gray-500 dark:text-whisper-900">
        Showing <span className="font-medium">{(page * LIMIT) + 1}</span> to <span className="font-medium">{getTotalPage()}</span> of{' '}
        <span className="font-medium">{totalMedia}</span> results
      </p>
    </div>
  );
};