import * as React from 'react';
import { PanelSettings } from '../../models';
import { CommandToCode } from '../CommandToCode';
import { useDebounce } from '../../hooks/useDebounce';
import { Collapsible } from './Collapsible';
import { VsLabel } from './VscodeComponents';
import useStartCommand from '../hooks/useStartCommand';
import { VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import { Messenger } from '@estruyf/vscode/dist/client';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface IGlobalSettingsProps {
  settings: PanelSettings | undefined;
  isBase?: boolean;
}

const GlobalSettings: React.FunctionComponent<IGlobalSettingsProps> = ({
  settings,
  isBase
}: React.PropsWithChildren<IGlobalSettingsProps>) => {
  const { modifiedDateUpdate, fmHighlighting } = settings || {};
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [startCommandValue, setStartCommandValue] = React.useState<string | null>(null);
  const [isDirty, setIsDirty] = React.useState<boolean>(false);
  const { startCommand } = useStartCommand(settings);

  const debounceStartCommand = useDebounce(startCommandValue, 1000);
  const debouncePreviewUrl = useDebounce(previewUrl, 1000);

  const onDateCheck = () => {
    Messenger.send(CommandToCode.updateModifiedUpdating, !modifiedDateUpdate);
  };

  const onHighlightCheck = () => {
    Messenger.send(CommandToCode.updateFmHighlight, !fmHighlighting);
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
      Messenger.send(CommandToCode.updatePreviewUrl, debouncePreviewUrl);
    }
  }, [debouncePreviewUrl]);

  React.useEffect(() => {
    if (isDirty) {
      setIsDirty(false);
      Messenger.send(CommandToCode.updateStartCommand, debounceStartCommand);
    }
  }, [debounceStartCommand]);

  return (
    <>
      <Collapsible
        id={`${isBase ? 'base_' : ''}settings`}
        className={`base__actions`}
        title={l10n.t(LocalizationKey.panelGlobalSettingsTitle)}
      >
        <div className={`base__action`}>
          <VsLabel>
            {l10n.t(LocalizationKey.panelGlobalSettingsActionModifiedDateLabel)}
          </VsLabel>
          <VSCodeCheckbox checked={modifiedDateUpdate} onClick={onDateCheck}>
            {l10n.t(LocalizationKey.panelGlobalSettingsActionModifiedDateDescription)}
          </VSCodeCheckbox>
        </div>
        <div className={`base__action`}>
          <VsLabel>
            {l10n.t(LocalizationKey.panelGlobalSettingsActionFrontMatterLabel)}
          </VsLabel>
          <VSCodeCheckbox checked={fmHighlighting} onClick={onHighlightCheck}>
            {l10n.t(LocalizationKey.panelGlobalSettingsActionFrontMatterDescription)}
          </VSCodeCheckbox>
        </div>
        <div className={`base__action`}>
          <VsLabel>
            {l10n.t(LocalizationKey.panelGlobalSettingsActionPreviewLabel)}
          </VsLabel>
          <input
            type={`text`}
            placeholder={l10n.t(LocalizationKey.dashboardPreviewInputPlaceholder, `http://localhost:1313`)}
            value={previewUrl}
            onChange={previewChange}
          />
        </div>
        <div className={`base__action`}>
          <VsLabel>
            {l10n.t(LocalizationKey.panelGlobalSettingsActionServerLabel)}
          </VsLabel>
          <input
            type={`text`}
            placeholder={l10n.t(LocalizationKey.panelGlobalSettingsActionServerPlaceholder, `hugo server -D`)}
            value={startCommandValue || ''}
            onChange={updateStartCommand}
          />
        </div>
      </Collapsible>
    </>
  );
};

GlobalSettings.displayName = 'GlobalSettings';
export { GlobalSettings };
