import * as React from 'react';
import { PageLayout } from '../Layout';
import { SponsorMsg } from '../Layout/SponsorMsg';
import { useRecoilValue } from 'recoil';
import { SettingsSelector } from '../../state';
import { Spinner } from '../Common/Spinner';
import { AstroContentTypes } from '../Configuration/Astro/AstroContentTypes';
import { ContentFolders } from '../Configuration/Common/ContentFolders';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { COMMAND_NAME } from '../../../constants';
import { RefreshIcon } from '@heroicons/react/outline';
import { VSCodePanelTab, VSCodePanelView, VSCodePanels } from '@vscode/webview-ui-toolkit/react';
import { CommonSettings } from './CommonSettings';

export interface ISettingsViewProps { }

export const SettingsView: React.FunctionComponent<ISettingsViewProps> = (_: React.PropsWithChildren<ISettingsViewProps>) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const settings = useRecoilValue(SettingsSelector);

  return (
    <PageLayout>
      {
        loading && <Spinner />
      }

      {
        settings && (
          <div className='mx-auto max-w-7xl w-full'>
            <div className='flex items-center justify-between'>
              <h1 className='text-3xl'>{l10n.t(LocalizationKey.commonSettings)}</h1>

              <a
                type="button"
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium focus:outline-none rounded text-[var(--vscode-button-foreground)] hover:text-[var(--vscode-button-foreground)] bg-[var(--frontmatter-button-background)] hover:bg-[var(--vscode-button-hoverBackground)] disabled:opacity-50`}
                href={`command:${COMMAND_NAME.settingsRefresh}`}
              >
                <RefreshIcon
                  className={`w-4 h-4 mr-2`}
                  aria-hidden="true"
                />
                <span>{l10n.t(LocalizationKey.commonRefreshSettings)}</span>
              </a>
            </div>

            <VSCodePanels className={`mt-4`}>
              <VSCodePanelTab id="view-1">{l10n.t(LocalizationKey.settingsViewCommon)}</VSCodePanelTab>
              <VSCodePanelTab id="view-2">{l10n.t(LocalizationKey.settingsViewContentFolders)}</VSCodePanelTab>

              {
                settings?.crntFramework === 'astro' && (
                  <VSCodePanelTab id="view-3">{l10n.t(LocalizationKey.settingsViewAstro)}</VSCodePanelTab>
                )
              }

              <VSCodePanelView id="view-1">
                <CommonSettings />
              </VSCodePanelView>

              <VSCodePanelView id="view-2">
                <div className='py-4'>
                  <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsContentFolders)}</h2>

                  <ContentFolders
                    settings={settings}
                    triggerLoading={(isLoading) => setLoading(isLoading)} />
                </div>
              </VSCodePanelView>

              {
                settings?.crntFramework === 'astro' && (
                  <VSCodePanelView id="view-3">
                    <div className='py-4'>
                      <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsContentTypes)}</h2>

                      <AstroContentTypes
                        settings={settings}
                        triggerLoading={(isLoading) => setLoading(isLoading)} />
                    </div>
                  </VSCodePanelView>
                )
              }
            </VSCodePanels>
          </div>
        )
      }

      <SponsorMsg
        beta={settings?.beta}
        version={settings?.versionInfo}
        isBacker={settings?.isBacker}
      />

      <img className='hidden' src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes%2Fmetrics%2Fdashboards&slug=settings" alt="Settings metrics" />
    </PageLayout >
  );
};