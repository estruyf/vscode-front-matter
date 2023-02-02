import { useState, useEffect } from 'react';
import { GeneralCommands } from '../../constants';
import { Mode } from '../../models/Mode';
import { DashboardData } from '../../models/DashboardData';
import { FolderInfo, PanelSettings } from '../../models/PanelSettings';
import { Command } from '../Command';
import { CommandToCode } from '../CommandToCode';
import { TagType } from '../TagType';
import { Messenger } from '@estruyf/vscode/dist/client';
import { EventData } from '@estruyf/vscode/dist/models';

export default function useMessages() {
  const [metadata, setMetadata] = useState<any>({});
  const [settings, setSettings] = useState<PanelSettings>();
  const [loading, setLoading] = useState<boolean>(false);
  const [focusElm, setFocus] = useState<TagType | null>(null);
  const [folderAndFiles, setFolderAndFiles] = useState<FolderInfo[] | undefined>(undefined);
  const [mediaSelecting, setMediaSelecting] = useState<DashboardData | undefined>(undefined);
  const [mode, setMode] = useState<Mode | undefined>(undefined);

  const messageListener = (event: MessageEvent<EventData<any>>) => {
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
      case Command.folderInfo:
        setFolderAndFiles(message.data);
        break;
      case Command.loading:
        setLoading(message.data);
        break;
      case Command.focusOnTags:
        setFocus(TagType.tags);
        break;
      case Command.focusOnCategories:
        setFocus(TagType.categories);
        break;
      case Command.mediaSelectionData:
        setMediaSelecting(message.data);
        break;
      case GeneralCommands.toWebview.setMode:
        setMode(message.data);
        break;
    }
  };

  useEffect(() => {
    if (loading) {
      window.setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  }, [loading]);

  useEffect(() => {
    Messenger.listen(messageListener);
    setLoading(true);

    // Show what you got after 5 seconds
    window.setTimeout(() => {
      setLoading(false);
    }, 5000);

    Messenger.send(CommandToCode.getData);
    Messenger.send(CommandToCode.getMode);

    return () => {
      Messenger.unlisten(messageListener);
    };
  }, []);

  return {
    metadata,
    settings,
    folderAndFiles,
    focusElm,
    loading,
    mediaSelecting,
    mode,
    unsetFocus: () => {
      setFocus(null);
    }
  };
}
