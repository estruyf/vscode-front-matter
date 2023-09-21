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
          <div className='mx-auto max-w-7xl'>
            <h1 className='text-3xl'>{l10n.t(LocalizationKey.commonSettings)}</h1>

            <div className='divide-y divide-[var(--frontmatter-border)]'>
              {
                settings?.crntFramework === 'astro' && (
                  <div className='py-4'>
                    <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsContentTypes)}</h2>

                    <AstroContentTypes
                      settings={settings}
                      triggerLoading={(isLoading) => setLoading(isLoading)} />
                  </div>
                )
              }

              <div className='py-4'>
                <h2 className='text-xl mb-2'>{l10n.t(LocalizationKey.settingsContentFolders)}</h2>

                <ContentFolders
                  settings={settings}
                  triggerLoading={(isLoading) => setLoading(isLoading)} />
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