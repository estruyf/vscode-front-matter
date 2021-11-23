import { EventData } from '@estruyf/vscode';
import { Messenger } from '@estruyf/vscode/dist/client';
import { RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DashboardCommand } from '../../DashboardCommand';
import { DashboardMessage } from '../../DashboardMessage';
import { LoadingAtom, MediaTotalSelector, PageAtom, SelectedMediaFolderSelector, SortingSelector } from '../../state';
import { FolderCreation } from './FolderCreation';
import { LIMIT } from './Media';
import { PaginationButton } from './PaginationButton';

export interface IPaginationProps {}

export const Pagination: React.FunctionComponent<IPaginationProps> = ({}: React.PropsWithChildren<IPaginationProps>) => {
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const crntSorting = useRecoilValue(SortingSelector);
  const totalMedia = useRecoilValue(MediaTotalSelector);
  const [ , setLoading ] = useRecoilState(LoadingAtom);
  const [ page, setPage ] = useRecoilState(PageAtom);
  
  const totalPages = Math.ceil(totalMedia / LIMIT) - 1;

  const getTotalPage = () => {
    const mediaItems = ((page + 1) * LIMIT);
    if (totalMedia < mediaItems) {
      return totalMedia;
    }
    return mediaItems;
  };

  // Write me function to retrieve buttons before and after current page
  const getButtons = (): number[] => {
    const maxButtons = 5;
    const buttons: number[] = [];
    const start = page - maxButtons;
    const end = page + maxButtons;

    for (let i = start; i <= end; i++) {
      if (i >= 0 && i <= totalPages) {
        buttons.push(i);
      }
    }
    return buttons;
  };

  const refresh = () => {
    setPage(0);
    Messenger.send(DashboardMessage.refreshMedia, { folder: selectedFolder });
  }

  const mediaUpdate = (message: MessageEvent<EventData<{ key: string, value: any }>>) => {
    if (message.data.command === DashboardCommand.mediaUpdate) {
      setLoading(true);
      Messenger.send(DashboardMessage.getMedia, {
        page,
        folder: selectedFolder || '',
        sorting: crntSorting
      });
    }
  }

  React.useEffect(() => {
    setLoading(true);
    Messenger.send(DashboardMessage.getMedia, {
      page,
      folder: selectedFolder || '',
      sorting: crntSorting
    });
  }, [page]);

  React.useEffect(() => {
    setLoading(true);
    Messenger.send(DashboardMessage.getMedia, {
      page: 0,
      folder: selectedFolder || '',
      sorting: crntSorting
    });
    setPage(0);
  }, [selectedFolder]);

  React.useEffect(() => {
    setLoading(true);
    Messenger.send(DashboardMessage.getMedia, {
      page,
      folder: selectedFolder || '',
      sorting: crntSorting
    });
  }, [crntSorting]);

  React.useEffect(() => {
    Messenger.listen(mediaUpdate);
  }, []);

  return (
    <nav
      className="py-4 px-5 flex items-center justify-between bg-gray-200 border-b border-gray-300 dark:bg-vulcan-400  dark:border-vulcan-100"
      aria-label="Pagination"
    >
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

      <FolderCreation />

      <div className="flex justify-between sm:justify-end space-x-2 text-sm">
        <PaginationButton
          title="First"
          disabled={page === 0}
          onClick={() => {
            if (page > 0) {
              setPage(0)
            }
          }} />

        <PaginationButton
          title="Previous"
          disabled={page === 0}
          onClick={() => {
            if (page > 0) {
              setPage(page - 1)
            }
          }} />
        
        {getButtons().map((button) => (
          <button
            key={button}
            disabled={button === page}
            onClick={() => {
              setPage(button)
            }
            }
            className={`${page === button ? 'bg-gray-200 px-2 text-vulcan-500' : 'text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500'}`}
          >{button + 1}</button>
        ))}

        <PaginationButton
          title="Next"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)} />

        <PaginationButton
          title="Last"
          disabled={page >= totalPages}
          onClick={() => setPage(totalPages)} />
      </div>
    </nav>
  );
};