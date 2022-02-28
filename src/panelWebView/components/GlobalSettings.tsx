import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../../helpers/MessageHelper';
import { useDebounce } from '../../hooks/useDebounce';
import { Collapsible } from './Collapsible';
import { VsLabel } from './VscodeComponents';
import useStartCommand from '../hooks/useStartCommand';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';

export interface IGlobalSettingsProps {
  settings: PanelSettings | undefined;
  isBase?: boolean;
}

const GlobalSettings: React.FunctionComponent<IGlobalSettingsProps> = ({settings, isBase}: React.PropsWithChildren<IGlobalSettingsProps>) => {
  const { modifiedDateUpdate, fmHighlighting } = settings || {};
  const [ previewUrl, setPreviewUrl ] = React.useState<string>("");
  const [ startCommandValue, setStartCommandValue ] = React.useState<string | null>(null);
  const [ isDirty, setIsDirty ] = React.useState<boolean>(false);
  const { startCommand } = useStartCommand(settings);

  const debounceStartCommand = useDebounce(startCommandValue, 1000);
  const debouncePreviewUrl = useDebounce(previewUrl, 1000);

  const onDateCheck = () => {
    MessageHelper.sendMessage(CommandToCode.updateModifiedUpdating, !modifiedDateUpdate);
  };
  
  const onHighlightCheck = () => {
    MessageHelper.sendMessage(CommandToCode.updateFmHighlight, !fmHighlighting);
  };

  const previewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    setPreviewUrl(e.currentTarget.value);
  };

  const updateStartCommand = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDirty(true);
    setStartCommandValue(e.currentTarget.value);
  };

  React.useEffect(() => {
    if (settings?.preview.host) {
      setPreviewUrl(settings.preview.host);
    }
  }, [settings?.preview.host]);

  React.useEffect(() => {
    setStartCommandValue(startCommand);
  }, [startCommand]);

  React.useEffect(() => {
    if (isDirty) {
      setIsDirty(false);
      MessageHelper.sendMessage(CommandToCode.updatePreviewUrl, debouncePreviewUrl);
    }
  }, [debouncePreviewUrl]);

  React.useEffect(() => {
    if (isDirty) {
      setIsDirty(false);
      MessageHelper.sendMessage(CommandToCode.updateStartCommand, debounceStartCommand);
    }
  }, [debounceStartCommand]);

  return (
    <>
      <Collapsible id={`${isBase ? "base_" : ""}settings`} className={`base__actions`} title="Global settings">
        <div className={`base__action`}>
          <VsLabel>Modified date</VsLabel>
          <VSCodeCheckbox checked={modifiedDateUpdate} onClick={onDateCheck}>Auto-update modified date</VSCodeCheckbox>
        </div>
        <div className={`base__action`}>
          <VsLabel>Front Matter highlight</VsLabel>
          <VSCodeCheckbox checked={fmHighlighting} onClick={onHighlightCheck}>Highlight Front Matter</VSCodeCheckbox>
        </div>
        <div className={`base__action`}>
          <VsLabel>Local preview</VsLabel>
          <input 
            type={`text`} 
            placeholder="Example: http://localhost:1313" 
            value={previewUrl}
            onChange={previewChange} />
        </div>
        <div className={`base__action`}>
          <VsLabel>Local server command</VsLabel>
          <input 
            type={`text`} 
            placeholder="Example: hugo server -D" 
            value={startCommandValue || ""}
            onChange={updateStartCommand} />
        </div>
      </Collapsible>
    </>
  );
};

GlobalSettings.displayName = 'GlobalSettings';
export { GlobalSettings };