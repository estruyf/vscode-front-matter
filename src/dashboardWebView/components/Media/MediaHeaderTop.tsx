import { EventData } from '@estruyf/vscode';
import { Messenger } from '@estruyf/vscode/dist/client';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePrevious } from '../../../panelWebView/hooks/usePrevious';
import { DashboardCommand } from '../../DashboardCommand';
import { DashboardMessage } from '../../DashboardMessage';
import {
  LoadingAtom,
  MediaTotalSelector,
  PageAtom,
  SelectedMediaFolderSelector,
  SettingsSelector,
  SortingSelector
} from '../../state';
import { Searchbox } from '../Header';
import { FolderCreation } from './FolderCreation';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { RefreshDashboardData } from '../Header/RefreshDashboardData';

export interface IMediaHeaderTopProps { }

export const MediaHeaderTop: React.FunctionComponent<
  IMediaHeaderTopProps
> = () => {
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);
  const selectedFolder = useRecoilValue(SelectedMediaFolderSelector);
  const crntSorting = useRecoilValue(SortingSelector);
  const [, setLoading] = useRecoilState(LoadingAtom);
  const [page, setPage] = useRecoilState(PageAtom);
  const settings = useRecoilValue(SettingsSelector);
  const totalMedia = useRecoilValue(MediaTotalSelector);
  const debounceGetMedia = useDebounce<string | null>(lastUpdated, 200);
  const prevSelectedFolder = usePrevious<string | null>(selectedFolder);

  const mediaUpdate = (message: MessageEvent<EventData<{ key: string; value: any }>>) => {
    if (message.data.command === DashboardCommand.mediaUpdate) {
      setLoading("loading");
      Messenger.send(DashboardMessage.getMedia, {
        page,
        folder: selectedFolder || '',
        sorting: crntSorting
      });
    }
  };

  React.useEffect(() => {
    if (
      prevSelectedFolder !== null ||
      settings?.dashboardState?.media.selectedFolder !== selectedFolder
    ) {
      setLoading("loading");
      setPage(0);
      setLastUpdated(new Date().getTime().toString());
    }
  }, [selectedFolder]);

  React.useEffect(() => {
    setLastUpdated(new Date().getTime().toString());
  }, [crntSorting]);

  React.useEffect(() => {
    if (debounceGetMedia) {
      setLoading("loading");

      Messenger.send(DashboardMessage.getMedia, {
        page,
        folder: selectedFolder || '',
        sorting: crntSorting
      });
    }
  }, [debounceGetMedia]);

  React.useEffect(() => {
    Messenger.listen(mediaUpdate);

    return () => {
      Messenger.unlisten(mediaUpdate);
    };
  }, [page, selectedFolder, crntSorting]);

  return (
    <nav
      className="px-4 py-2 flex items-center justify-between gap-4"
      aria-label="Pagination"
    >
      <div className="flex flex-col min-w-0">
        <h1 className="text-lg font-semibold leading-tight" style={{ color: 'var(--fm-text-hi)' }}>
          {l10n.t(LocalizationKey.dashboardHeaderTabsMedia)}
        </h1>
        <div className="mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: 'var(--fm-text-lo)' }}>
          {/* Always show the count, otherwise the refresh button is left on its own line */}
          <p className="text-xs leading-tight mt-0.5" style={{ fontFamily: 'var(--fm-mono)', color: 'var(--fm-text-lo)' }}>
            {totalMedia || 0} {totalMedia === 1 ? 'item' : 'items'}{` `}&middot;{` `}
          </p>

          <RefreshDashboardData />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Searchbox placeholder={l10n.t(LocalizationKey.dashboardMediaMediaHeaderTopSearchboxPlaceholder)} />

        <FolderCreation />
      </div>
    </nav>
  );
};
