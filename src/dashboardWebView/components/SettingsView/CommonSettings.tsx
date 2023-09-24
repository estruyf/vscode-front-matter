import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { Startup } from '../Header/Startup';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { SettingsInput } from './SettingsInput';
import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { FrameworkDetectors, SETTING_FRAMEWORK_START, SETTING_PREVIEW_HOST, SETTING_WEBSITE_URL } from '../../../constants';
import { messageHandler } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';

export interface ICommonSettingsProps { }

interface Config {
  name: string;
  value: string;
}

export const CommonSettings: React.FunctionComponent<ICommonSettingsProps> = (props: React.PropsWithChildren<ICommonSettingsProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [config, setConfig] = React.useState<Config[]>([]);
  const [updated, setUpdated] = React.useState<boolean>(false);

  const onSettingChange = React.useCallback((name: string, value: string) => {
    setConfig((prev) => {
      const setting = prev.find((c) => c.name === name);
      if (setting) {
        setting.value = value;
      } else {
        prev.push({
          name,
          value
        });
      }
      return [...prev];
    });
    setUpdated(true);
  }, [config]);

  const retrieveSettings = () => {
    messageHandler.request<Config[]>(DashboardMessage.getSettings, [SETTING_PREVIEW_HOST, SETTING_WEBSITE_URL, SETTING_FRAMEWORK_START]).then((config) => {
      setConfig(config);
      setUpdated(false);
    });
  }

  const saveSettings = React.useCallback(() => {
    messageHandler.request(DashboardMessage.setSettings, config).then(() => {
      retrieveSettings();
    });
  }, [config])

  React.useEffect(() => {
    if (settings?.lastUpdated) {
      retrieveSettings();
    }
  }, [settings?.lastUpdated]);

  return (
    <div className='w-full divide-y divide-[var(--frontmatter-border)]'>
      <div className='py-4'>
        <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsOpenOnStartup)}</h2>

        <Startup settings={settings} />
      </div>

      <div className='py-4'>
        <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsCommonSettingsWebsiteTitle)}</h2>

        <div className='space-y-2'>
          <SettingsInput
            label={l10n.t(LocalizationKey.settingsCommonSettingsPreviewUrl)}
            name={SETTING_PREVIEW_HOST}
            value={config.find((c) => c.name === SETTING_PREVIEW_HOST)?.value || ""}
            onChange={onSettingChange}
          />

          <SettingsInput
            label={l10n.t(LocalizationKey.settingsCommonSettingsWebsiteUrl)}
            name={SETTING_WEBSITE_URL}
            value={config.find((c) => c.name === SETTING_WEBSITE_URL)?.value || ""}
            onChange={onSettingChange}
          />

          <SettingsInput
            label={l10n.t(LocalizationKey.settingsCommonSettingsStartCommand)}
            name={SETTING_FRAMEWORK_START}
            value={config.find((c) => c.name === SETTING_FRAMEWORK_START)?.value || ""}
            onChange={onSettingChange}
            fallback={FrameworkDetectors.find((f) => f.framework.name === settings?.crntFramework)?.commands.start || ""}
          />

          <div className={`mt-4 flex gap-2`}>
            <VSCodeButton appearance="secondary" onClick={retrieveSettings}>
              {l10n.t(LocalizationKey.commonCancel)}
            </VSCodeButton>
            <VSCodeButton disabled={!updated} onClick={saveSettings}>
              {l10n.t(LocalizationKey.commonSave)}
            </VSCodeButton>
          </div>
        </div>
      </div>
      <div className='py-4 space-y-2'>
        <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsDiagnostic)}</h2>

        <p>{l10n.t(LocalizationKey.settingsDiagnosticDescription)}</p>

        <p>
          <a
            href={`command:frontMatter.diagnostics`}
            title={l10n.t(LocalizationKey.settingsDiagnosticLink)}
            className='text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]'
          >
            {l10n.t(LocalizationKey.settingsDiagnosticLink)}
          </a>
        </p>
      </div>
    </div>
  );
};