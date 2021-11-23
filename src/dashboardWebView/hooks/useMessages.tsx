import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { DashboardCommand } from '../DashboardCommand';
import { DashboardMessage } from '../DashboardMessage';
import { Page } from '../models/Page';
import { DashboardViewAtom, SettingsAtom, ViewDataAtom } from '../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';
import { ViewType } from '../models';

export default function useMessages() {
  const [loading, setLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useRecoilState(SettingsAtom);
  const [viewData, setViewData] = useRecoilState(ViewDataAtom);
  const [, setView] = useRecoilState(DashboardViewAtom);

  Messenger.listen((message: MessageEvent<EventData<any>>) => {
    switch (message.data.command) {
      case DashboardCommand.loading:
        setLoading(message.data.data);
        break;
      case DashboardCommand.viewData:
        setViewData(message.data.data);
        if (message.data.data?.type === ViewType.Media) {
          setView(ViewType.Media);
        }
        break;
      case DashboardCommand.settings:
        setSettings(message.data.data);
        break;
      case DashboardCommand.pages:
        setPages(message.data.data);
        setLoading(false);
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