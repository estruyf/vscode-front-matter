import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { MessageHelper } from '../helper/MessageHelper';
import { useDebounce } from '../hooks/useDebounce';
import { Collapsible } from './Collapsible';
import { VsCheckbox, VsLabel } from './VscodeComponents';

export interface IGlobalSettingsProps {
  settings: PanelSettings | undefined;
  isBase?: boolean;
}

export const GlobalSettings: React.FunctionComponent<IGlobalSettingsProps> = ({settings, isBase}: React.PropsWithChildren<IGlobalSettingsProps>) => {
  const { modifiedDateUpdate, fmHighlighting } = settings || {};
  const [ previewUrl, setPreviewUrl ] = React.useState<string>("");
  const [ isDirty, setIsDirty ] = React.useState<boolean>(false);
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

  React.useEffect(() => {
    if (settings?.preview.host) {
      setPreviewUrl(settings.preview.host);
    }
  }, [settings?.preview.host]);

  React.useEffect(() => {
    if (isDirty) {
      console.log(debouncePreviewUrl);
      setIsDirty(false);
      MessageHelper.sendMessage(CommandToCode.updatePreviewUrl, debouncePreviewUrl);
    }
  }, [debouncePreviewUrl]);

  return (
    <>
      <Collapsible id={`${isBase ? "base_" : ""}settings`} className={`base__actions`} title="Global settings">
        <div className={`base__action`}>
          <VsLabel>Modified date</VsLabel>
          <VsCheckbox label="Auto-update modified date" checked={modifiedDateUpdate} onClick={onDateCheck} />
        </div>
        <div className={`base__action`}>
          <VsLabel>Front Matter highlight</VsLabel>
          <VsCheckbox label="Highlight Front Matter" checked={fmHighlighting} onClick={onHighlightCheck} />
        </div>
        <div className={`base__action`}>
          <VsLabel>Local preview</VsLabel>
          <input 
            type={`text`} 
            placeholder="Example: http://localhost:1313" 
            value={previewUrl}
            onChange={previewChange} />
        </div>
      </Collapsible>
    </>
  );
};