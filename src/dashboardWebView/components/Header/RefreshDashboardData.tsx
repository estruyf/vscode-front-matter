import { Messenger } from '@estruyf/vscode/dist/client';
import { RefreshIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { DashboardMessage } from '../../DashboardMessage';
import useThemeColors from '../../hooks/useThemeColors';
import { NavigationType } from '../../models';
import {
  CategoryAtom,
  DashboardViewAtom,
  FolderAtom,
  LoadingAtom,
  PageAtom,
  SearchAtom,
  SelectedMediaFolderSelector,
  SortingAtom,
  TagAtom
} from '../../state';

export interface IRefreshDashboardDataProps {}

export const RefreshDashboardData: React.FunctionComponent<IRefreshDashboardDataProps> = (
  props: React.PropsWithChildren<IRefreshDashboardDataProps>
) => {
  const view = useRecoilValue(DashboardViewAtom);
  const [, setLoading] = useRecoilState(LoadingAtom);
  const resetSearch = useResetRecoilState(SearchAtom);
  const resetSorting = useResetRecoilState(SortingAtom);
  const resetFolder = useResetRecoilState(FolderAtom);
  const resetTag = useResetRecoilState(TagAtom);
  const resetCategory = useResetRecoilState(CategoryAtom);
  // Media
  const resetPage = useResetRecoilState(PageAtom);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const { getColors } = useThemeColors();

  const refreshPages = () => {
    setLoading(true);
    resetSearch();
    resetSorting();
    resetFolder();
    resetTag();
    resetCategory();
    Messenger.send(DashboardMessage.refreshPages);
  };

  const refreshMedia = () => {
    setLoading(true);
    resetPage();
    resetSearch();
    Messenger.send(DashboardMessage.refreshMedia, { folder: selectedFolder });
  };

  const refresh = useCallback(() => {
    if (view === NavigationType.Contents) {
      refreshPages();
    } else if (view === NavigationType.Media) {
      refreshMedia();
    }
  }, [view]);

  return (
    <button
      className={`mr-2 ${
        getColors(
          'text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500',
          'text-[var(--vscode-foreground)] hover:text-[var(--vscode-textLink-foreground)]'
        )
      }`}
      title="Refresh dashboard"
      onClick={refresh}
    >
      <RefreshIcon className={`h-5 w-5`} />
      <span className="sr-only">Refresh dashboard</span>
    </button>
  );
};
