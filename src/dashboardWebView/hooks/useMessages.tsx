import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { DashboardCommand } from '../DashboardCommand';
import { DashboardMessage } from '../DashboardMessage';
import { Page } from '../models/Page';
import { DashboardViewAtom, LoadingAtom, SettingsAtom, ViewDataAtom, SearchReadyAtom } from '../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { NavigationType } from '../models';

export default function useMessages() {
  const [loading, setLoading] = useRecoilState(LoadingAtom);
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useRecoilState(SettingsAtom);
  const [viewData, setViewData] = useRecoilState(ViewDataAtom);
  const [, setView] = useRecoilState(DashboardViewAtom);
  const [, setSearchReady] = useRecoilState(SearchReadyAtom);

  Messenger.listen((message: MessageEvent<EventData<any>>) => {
    switch (message.data.command) {
      case DashboardCommand.loading:
        setLoading(message.data.data);
        break;
      case DashboardCommand.viewData:
        setViewData(message.data.data);
        if (message.data.data?.type === NavigationType.Media) {
          setView(NavigationType.Media);
        } else if (message.data.data?.type === NavigationType.Contents) {
          setView(NavigationType.Contents);
        } else if (message.data.data?.type === NavigationType.Data) {
          setView(NavigationType.Data);
        } else if (message.data.data?.type === NavigationType.Snippets) {
          setView(NavigationType.Snippets);
        }
        break;
      case DashboardCommand.settings:
        setSettings(message.data.data);
        break;
      case DashboardCommand.pages:
        setPages(message.data.data);
        setLoading(false);
        break;
      case DashboardCommand.searchReady:
        setSearchReady(true);
        break;
    }
  });

  useEffect(() => {
    setLoading(true);
    Messenger.send(DashboardMessage.getViewType);
    Messenger.send(DashboardMessage.getTheme);
    Messenger.send(DashboardMessage.getData);
  }, ['']);

  return {
    loading,
    pages,
    viewData,
    settings
  };
}