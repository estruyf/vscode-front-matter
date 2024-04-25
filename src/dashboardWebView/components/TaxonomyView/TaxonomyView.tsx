import { Messenger, messageHandler } from '@estruyf/vscode/dist/client';
import { ChevronRightIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { GeneralCommands, TelemetryEvent } from '../../../constants';
import { TaxonomyData } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { Page, PageMappings } from '../../models';
import { SettingsSelector } from '../../state';
import { NavigationBar, NavigationItem } from '../Layout';
import { PageLayout } from '../Layout/PageLayout';
import { SponsorMsg } from '../Layout/SponsorMsg';
import { TaxonomyManager } from './TaxonomyManager';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { TaxonomyTagging } from './TaxonomyTagging';

export interface ITaxonomyViewProps {
  pages: Page[];
}

export const TaxonomyView: React.FunctionComponent<ITaxonomyViewProps> = ({
  pages
}: React.PropsWithChildren<ITaxonomyViewProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [taxonomySettings, setTaxonomySettings] = useState<TaxonomyData>();
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string | null>(`tags`);
  const [contentTagging, setContentTagging] = useState<string | null>(null);

  const onImport = () => {
    Messenger.send(DashboardMessage.importTaxonomy);
  };

  const onContentMapping = React.useCallback((value: string, pageMappings: PageMappings) => {
    messageHandler.request(DashboardMessage.mapTaxonomy, {
      taxonomy: selectedTaxonomy,
      value,
      pageMappings
    }).then(() => {
      setContentTagging(null);
    }).catch(() => {
      setContentTagging(null);
    });
  }, [selectedTaxonomy]);

  useEffect(() => {
    setTaxonomySettings({
      tags: settings?.tags || [],
      categories: settings?.categories || [],
      customTaxonomy: settings?.customTaxonomy || []
    });
  }, [settings?.tags, settings?.categories, settings?.customTaxonomy]);

  useEffect(() => {
    Messenger.send(DashboardMessage.sendTelemetry, {
      event: TelemetryEvent.webviewTaxonomyDashboard
    });

    Messenger.send(GeneralCommands.toVSCode.logging.info, "DASHBOARD: Taxonomy view loaded");
  }, []);

  return (
    <PageLayout contentClass={`relative w-full flex-grow flex flex-col mx-auto overflow-hidden`}>
      <div className={`h-full w-full flex`}>
        <NavigationBar
          title={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyViewNavigationBarTitle)}
          bottom={
            <button
              className={`-mb-4 text-xs opacity-80 flex items-center text-gray-500 dark:text-whisper-900 hover:text-gray-700 dark:hover:text-whisper-500`}
              title={l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyViewButtonImport)}
              onClick={onImport}
            >
              <ArrowDownTrayIcon className={`w-5 mr-2`} />
              <span>{l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyViewButtonImport)}</span>
            </button>
          }
        >
          <NavigationItem
            isSelected={selectedTaxonomy === 'tags'}
            onClick={() => {
              setSelectedTaxonomy(`tags`);
              setContentTagging(null);
            }}
          >
            <ChevronRightIcon className="-ml-1 w-5 mr-2" />
            <span>{l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyViewNavigationItemTags)}</span>
          </NavigationItem>

          <NavigationItem
            isSelected={selectedTaxonomy === 'categories'}
            onClick={() => {
              setSelectedTaxonomy(`categories`);
              setContentTagging(null);
            }}
          >
            <ChevronRightIcon className="-ml-1 w-5 mr-2" />
            <span>{l10n.t(LocalizationKey.dashboardTaxonomyViewTaxonomyViewNavigationItemCategories)}</span>
          </NavigationItem>

          {taxonomySettings?.customTaxonomy &&
            taxonomySettings.customTaxonomy.map((taxonomy, index) => (
              <NavigationItem
                key={`${taxonomy.id}-${index}`}
                isSelected={selectedTaxonomy === taxonomy.id}
                onClick={() => {
                  setSelectedTaxonomy(taxonomy.id);
                  setContentTagging(null);
                }}
              >
                <ChevronRightIcon className="-ml-1 w-5 mr-2" />
                <span className={`first-letter:uppercase`}>{taxonomy.id}</span>
              </NavigationItem>
            ))}
        </NavigationBar>

        <div className={`w-10/12 h-full overflow-hidden`}>
          {
            contentTagging ? (
              <TaxonomyTagging
                value={contentTagging}
                taxonomy={selectedTaxonomy}
                pages={pages}
                onContentMapping={(value: string, pageMappings: PageMappings) => onContentMapping(value, pageMappings)}
                onDismiss={() => setContentTagging(null)} />
            ) : (
              <TaxonomyManager
                data={taxonomySettings}
                taxonomy={selectedTaxonomy}
                pages={pages}
                onContentTagging={(value: string) => setContentTagging(value)} />
            )
          }
        </div>
      </div>

      <SponsorMsg
        beta={settings?.beta}
        version={settings?.versionInfo}
        isBacker={settings?.isBacker}
      />

      <img className='hidden' src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes%2Fmetrics%2Fdashboards&slug=taxonomy" alt="Taxonomy metrics" />
    </PageLayout>
  );
};
