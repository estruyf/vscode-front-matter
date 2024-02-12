import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { MediaInfo, MediaPaths } from '../../models';
import { DashboardCommand } from '../DashboardCommand';
import {
  AllContentFoldersAtom,
  AllStaticFoldersAtom,
  LoadingAtom,
  MediaFoldersAtom,
  MediaTotalAtom,
  PageAtom,
  SearchAtom,
  SelectedMediaFolderAtom,
  SettingsAtom
} from '../state';
import Fuse from 'fuse.js';
import usePagination from './usePagination';
import { usePrevious } from '../../panelWebView/hooks/usePrevious';

const fuseOptions: Fuse.IFuseOptions<MediaInfo> = {
  keys: [
    { name: 'filename', weight: 0.8 },
    { name: 'fsPath', weight: 0.5 },
    { name: 'caption', weight: 0.5 },
    { name: 'alt', weight: 0.5 }
  ],
  threshold: 0.2,
  includeScore: true
};

export default function useMedia() {
  const [media, setMedia] = useState<MediaInfo[]>([]);
  // const page = useRecoilValue(PageAtom);
  const [page, setPage] = useRecoilState(PageAtom);
  const [searchedMedia, setSearchedMedia] = useState<MediaInfo[]>([]);
  const [, setSelectedFolder] = useRecoilState(SelectedMediaFolderAtom);
  const [, setTotal] = useRecoilState(MediaTotalAtom);
  const [, setFolders] = useRecoilState(MediaFoldersAtom);
  const [, setAllContentFolders] = useRecoilState(AllContentFoldersAtom);
  const [, setAllStaticFolders] = useRecoilState(AllStaticFoldersAtom);
  const [, setLoading] = useRecoilState(LoadingAtom);
  const search = useRecoilValue(SearchAtom);
  const prevSearch = usePrevious<string>(search);
  const settings = useRecoilValue(SettingsAtom);
  const { pageSetNr } = usePagination(settings?.dashboardState.contents.pagination);

  useEffect(() => {
    if (prevSearch !== search) {
      setPage(0);
    }
  }, [search, prevSearch]);

  const allMedia = useMemo(() => {
    return searchedMedia.slice(page * pageSetNr, (page + 1) * pageSetNr);
  }, [searchedMedia, page, pageSetNr]);

  const searchMedia = (search: string, media: MediaInfo[]) => {
    if (search) {
      const fuse = new Fuse(media, fuseOptions);
      const results = fuse.search(search);
      const newSearchedMedia = results.map((page) => page.item);

      setSearchedMedia(newSearchedMedia);
      setTotal(results.length);

      return;
    }

    setTotal(media.length);
    setSearchedMedia(media);
  }

  const messageListener = useCallback((message: MessageEvent<EventData<MediaPaths | { key: string; value: any }>>) => {
    if (message.data.command === DashboardCommand.media) {
      const payload: MediaPaths = message.data.payload as MediaPaths;
      setLoading(undefined);
      setMedia(payload.media);
      setTotal(payload.total);
      setFolders(payload.folders);
      setSelectedFolder(payload.selectedFolder);
      if (search) {
        searchMedia(search, payload.media);
      } else {
        setSearchedMedia(payload.media);
      }
      setAllContentFolders(payload.allContentFolders);
      setAllStaticFolders(payload.allStaticfolders);
    }
  }, [search]);

  useEffect(() => {
    searchMedia(search, media);
  }, [search, media]);

  useEffect(() => {
    Messenger.listen<MediaPaths>(messageListener);

    return () => {
      Messenger.unlisten(messageListener);
    };
  }, [search]);

  return {
    media: allMedia
  };
}
