import { useState, useEffect } from 'react';
import { MessageHelper } from '../../helpers/MessageHelper';
import { DashboardCommand } from '../DashboardCommand';
import { DashboardMessage } from '../DashboardMessage';
import { Page } from '../models/Page';

const vscode = MessageHelper.getVsCodeAPI();

export default function useMessages(options?: any) {
  const [loading, setLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);

  window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.command) {
      case DashboardCommand.loading:
        setLoading(message.data);
        break;
      case DashboardCommand.data:
        setPages(message.data);
        setLoading(false);
        break;
    }
  });

  useEffect(() => {    
    setLoading(true);
    vscode.postMessage({ command: DashboardMessage.getData });
  }, ['']);

  return {
    loading,
    pages
  };
}