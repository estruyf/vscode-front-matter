import { Messenger } from '@estruyf/vscode/dist/client';
import { RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { DashboardMessage } from '../../DashboardMessage';
import { CategoryAtom, FolderAtom, LoadingAtom, SearchAtom, SortingAtom, TagAtom } from '../../state';

export interface IRefreshPagesProps {}

export const RefreshPages: React.FunctionComponent<IRefreshPagesProps> = (props: React.PropsWithChildren<IRefreshPagesProps>) => {
  const [, setLoading] = useRecoilState(LoadingAtom);
  const resetSearch = useResetRecoilState(SearchAtom);
  const resetSorting = useResetRecoilState(SortingAtom);
  const resetFolder = useResetRecoilState(FolderAtom);
  const resetTag = useResetRecoilState(TagAtom);
  const resetCategory = useResetRecoilState(CategoryAtom);
  
  const refresh = () => {
    setLoading(true);
    resetSearch();
    resetSorting();
    resetFolder();
    resetTag();
    resetCategory();
    Messenger.send(DashboardMessage.refreshPages);
  }
  
  return (
    <button className={`mr-2 text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500`}
              title="Refresh dashboard"
              onClick={refresh}>
      <RefreshIcon className={`h-5 w-5`} />
      <span className="sr-only">Refresh dashboard</span>
    </button>
  );
};