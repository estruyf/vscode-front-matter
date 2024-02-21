import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { LocalizationKey } from '../../../localization';
import { GeneralCommands, ExtensionState } from '../../../constants';
import { SettingsInput } from './SettingsInput';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';

export interface IIntegrationsViewProps { }

export const IntegrationsView: React.FunctionComponent<IIntegrationsViewProps> = ({ }: React.PropsWithChildren<IIntegrationsViewProps>) => {
  const [deeplApiKey, setDeeplApiKey] = React.useState<string>('');
  const [crntDeeplApiKey, setCrntDeeplApiKey] = React.useState<string>('');

  const onSave = React.useCallback(() => {
    messageHandler.request<string>(GeneralCommands.toVSCode.secrets.set, {
      key: ExtensionState.Secrets.DeeplApiKey,
      value: crntDeeplApiKey
    }).then((apiKey: string) => {
      setDeeplApiKey(apiKey);
    });
  }, [crntDeeplApiKey]);

  const onChange = (_: string, value: string) => {
    setCrntDeeplApiKey(value);
  };

  React.useEffect(() => {
    messageHandler.request<string>(GeneralCommands.toVSCode.secrets.get, ExtensionState.Secrets.DeeplApiKey).then((apiKey: string) => {
      setDeeplApiKey(apiKey);
      setCrntDeeplApiKey(apiKey);
    });
  }, []);

  return (
    <div className='w-full divide-y divide-[var(--frontmatter-border)]'>
      <div className='py-4 space-y-4'>
        <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsIntegrationsViewDeeplTitle)}</h2>

        <SettingsInput
          label={l10n.t(LocalizationKey.settingsIntegrationsViewDeeplIntputLabel)}
          name={ExtensionState.Secrets.DeeplApiKey}
          value={crntDeeplApiKey || ""}
          placeholder={l10n.t(LocalizationKey.settingsIntegrationsViewDeeplIntputPlaceholder)}
          onChange={onChange}
        />

        <div className={`mt-4 flex gap-2`}>
          <VSCodeButton
            onClick={onSave}
            disabled={deeplApiKey === crntDeeplApiKey}>
            {l10n.t(LocalizationKey.commonSave)}
          </VSCodeButton>
        </div>
      </div>
    </div>
  );
};