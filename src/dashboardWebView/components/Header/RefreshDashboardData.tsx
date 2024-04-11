import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { DashboardMessage } from '../../DashboardMessage';
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
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { ArrowClockwiseIcon } from '../../../components/icons/ArrowClockwiseIcon';

export interface IRefreshDashboardDataProps { }

export const RefreshDashboardData: React.FunctionComponent<IRefreshDashboardDataProps> = (
  { }: React.PropsWithChildren<IRefreshDashboardDataProps>
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

  const refreshPages = () => {
    setLoading("initPages");
    resetSearch();
    resetSorting();
    resetFolder();
    resetTag();
    resetCategory();
    Messenger.send(DashboardMessage.refreshPages);
  };

  const refreshMedia = () => {
    setLoading("initPages");
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
      className={`mr-2 text-[var(--frontmatter-text)] hover:text-[var(--vscode-textLink-foreground)]`}
      title={l10n.t(LocalizationKey.dashboardHeaderRefreshDashboardLabel)}
      onClick={refresh}
    >
      <ArrowClockwiseIcon className={`h-5 w-5`} />
      <span className="sr-only">{l10n.t(LocalizationKey.dashboardHeaderRefreshDashboardLabel)}</span>
    </button>
  );
};
