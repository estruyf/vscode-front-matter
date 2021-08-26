import { useState, useEffect } from 'react';
import { MessageHelper } from '../../helpers/MessageHelper';
import { ContentFolder } from '../../models';
import { DashboardCommand } from '../DashboardCommand';
import { DashboardMessage } from '../DashboardMessage';
import { Page } from '../models/Page';
import { Settings } from '../models/Settings';

const vscode = MessageHelper.getVsCodeAPI();

export default function useMessages(options?: any) {
  const [loading, setLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [settings, setSettings] = useState<Settings>({} as any);

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