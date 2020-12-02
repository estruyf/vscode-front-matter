import { useState, useEffect } from 'react';
import { PanelSettings } from '../../models/PanelSettings';
import { Command } from '../Command';
import { CommandToCode } from '../CommandToCode';

declare const acquireVsCodeApi: <T = unknown>() => {
  getState: () => T;
  setState: (data: T) => void;
  postMessage: (msg: unknown) => void;
};

const vscode = acquireVsCodeApi();

export default function useMessages() {
  const [metadata, setMetadata] = useState<any>({});
  const [settings, setSettings] = useState<PanelSettings>();
  const [loading, setLoading] = useState<boolean>(false);

  window.addEventListener('message', event => {
    const message = event.data;
    
    switch (message.command) {
      case Command.metadata:
        setMetadata(message.data);
        setLoading(false);
        break;
      case Command.settings:
        setSettings(message.data);
        setLoading(false);
        break;
      case Command.loading:
        setLoading(message.data);
        break;
    }
  });

  useEffect(() => {    
    setLoading(true);
    vscode.postMessage({ command: CommandToCode.getData });
  }, ['']);

  return {
    metadata,
    settings,
    loading,
    sendMessage: (command: CommandToCode, data?: any) => {
      if (data) {
        vscode.postMessage({ command, data });
      } else {
        vscode.postMessage({ command });
      }
    }
  };
}