import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { LocalizationKey } from '../../../localization';
import { GeneralCommands, ExtensionState } from '../../../constants';
import { SettingsInput } from './SettingsInput';
import { Button as VSCodeButton } from 'vscrui';

export interface IIntegrationsViewProps { }

export const IntegrationsView: React.FunctionComponent<IIntegrationsViewProps> = () => {
  const [deeplApiKey, setDeeplApiKey] = React.useState<string>('');
  const [azureApiKey, setAzureApiKey] = React.useState<string>('');
  const [azureRegion, setAzureRegion] = React.useState<string>('');
  const [crntDeeplApiKey, setCrntDeeplApiKey] = React.useState<string>('');
  const [crntAzureApiKey, setCrntAzureApiKey] = React.useState<string>('');
  const [crntAzureRegion, setCrntAzureRegion] = React.useState<string>('');

  const onSave = React.useCallback(() => {
    if (crntDeeplApiKey !== deeplApiKey) {
      messageHandler.request<string>(GeneralCommands.toVSCode.secrets.set, {
        key: ExtensionState.Secrets.Deepl.ApiKey,
        value: crntDeeplApiKey
      }).then((apiKey: string) => {
        setDeeplApiKey(apiKey);
      });
    }

    if (crntAzureApiKey !== azureApiKey) {
      messageHandler.request<string>(GeneralCommands.toVSCode.secrets.set, {
        key: ExtensionState.Secrets.Azure.TranslatorKey,
        value: crntAzureApiKey
      }).then((apiKey: string) => {
        setAzureApiKey(apiKey);
      });
    }

    if (crntAzureRegion !== azureRegion) {
      messageHandler.request<string>(GeneralCommands.toVSCode.secrets.set, {
        key: ExtensionState.Secrets.Azure.TranslatorRegion,
        value: crntAzureRegion
      }).then((apiKey: string) => {
        setAzureRegion(apiKey);
      });
    }
  }, [crntDeeplApiKey, deeplApiKey, crntAzureApiKey, azureApiKey, crntAzureRegion, azureRegion]);

  const onChange = (key: string, value: string) => {
    if (key === ExtensionState.Secrets.Deepl.ApiKey) {
      setCrntDeeplApiKey(value);
    } else if (key === ExtensionState.Secrets.Azure.TranslatorKey) {
      setCrntAzureApiKey(value);
    } else if (key === ExtensionState.Secrets.Azure.TranslatorRegion) {
      setCrntAzureRegion(value);
    }
  };

  React.useEffect(() => {
    messageHandler.request<string>(GeneralCommands.toVSCode.secrets.get, ExtensionState.Secrets.Deepl.ApiKey).then((apiKey: string) => {
      setDeeplApiKey(apiKey);
      setCrntDeeplApiKey(apiKey);
    });
    messageHandler.request<string>(GeneralCommands.toVSCode.secrets.get, ExtensionState.Secrets.Azure.TranslatorKey).then((apiKey: string) => {
      setAzureApiKey(apiKey);
      setCrntAzureApiKey(apiKey);
    });
    messageHandler.request<string>(GeneralCommands.toVSCode.secrets.get, ExtensionState.Secrets.Azure.TranslatorRegion).then((apiKey: string) => {
      setAzureRegion(apiKey);
      setCrntAzureRegion(apiKey);
    });
  }, []);

  return (
    <div className='w-full divide-y divide-[var(--frontmatter-border)]'>
      <div className='py-4 space-y-4'>
        <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsIntegrationsViewDeeplTitle)}</h2>

        <SettingsInput
          label={l10n.t(LocalizationKey.settingsIntegrationsViewDeeplIntputLabel)}
          name={ExtensionState.Secrets.Deepl.ApiKey}
          value={crntDeeplApiKey || ""}
          placeholder={l10n.t(LocalizationKey.settingsIntegrationsViewDeeplIntputPlaceholder)}
          onChange={onChange}
        />

        <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsIntegrationsViewAzureTitle)}</h2>

        <SettingsInput
          label={l10n.t(LocalizationKey.settingsIntegrationsViewAzureIntputLabel)}
          name={ExtensionState.Secrets.Azure.TranslatorKey}
          value={crntAzureApiKey || ""}
          placeholder={l10n.t(LocalizationKey.settingsIntegrationsViewAzureIntputPlaceholder)}
          onChange={onChange}
        />
        <SettingsInput
          label={l10n.t(LocalizationKey.settingsIntegrationsViewAzureRegionLabel)}
          name={ExtensionState.Secrets.Azure.TranslatorRegion}
          value={crntAzureRegion || ""}
          placeholder={l10n.t(LocalizationKey.settingsIntegrationsViewAzureRegionPlaceholder)}
          onChange={onChange}
        />

        <div className={`mt-4 flex gap-2`}>
          <VSCodeButton
            onClick={onSave}
            disabled={
              deeplApiKey === crntDeeplApiKey &&
              azureApiKey === crntAzureApiKey &&
              azureRegion === crntAzureRegion
            }>
            {l10n.t(LocalizationKey.commonSave)}
          </VSCodeButton>
        </div>
      </div>
    </div>
  );
};