import { useState, useEffect } from 'react';
import { PanelSettings } from '../../models/PanelSettings';
import { Command } from '../Command';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { TagType } from '../TagType';

const vscode = MessageHelper.getVsCodeAPI();

export default function useMessages() {
  const [metadata, setMetadata] = useState<any>({});
  const [settings, setSettings] = useState<PanelSettings>();
  const [loading, setLoading] = useState<boolean>(false);
  const [focusElm, setFocus] = useState<TagType | null>(null);

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
      case Command.focusOnTags:
        setFocus(TagType.tags);
        break;
      case Command.focusOnCategories:
        setFocus(TagType.categories);
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
    focusElm,
    loading,
    unsetFocus: () => { setFocus(null) }
  };
}