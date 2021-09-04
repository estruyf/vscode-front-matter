import { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { MessageHelper } from '../../helpers/MessageHelper';
import { DashboardCommand } from '../DashboardCommand';
import { DashboardMessage } from '../DashboardMessage';
import { Page } from '../models/Page';
import { SettingsAtom } from '../state/atom/SettingsAtom';

const vscode = MessageHelper.getVsCodeAPI();

export default function useMessages() {
  const [loading, setLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useRecoilState(SettingsAtom);

  window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
      case DashboardCommand.loading:
        setLoading(message.data);
        break;
      case DashboardCommand.settings:
        setSettings(message.data);
        break;
      case DashboardCommand.pages:
        setPages(message.data);
        setLoading(false);
        break;
    }
  });

  useEffect(() => {    
    setLoading(true);
    vscode.postMessage({ command: DashboardMessage.getTheme });
    vscode.postMessage({ command: DashboardMessage.getData });
  }, ['']);

  return {
    loading,
    pages,
    settings
  };
}