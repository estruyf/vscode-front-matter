import { Messenger } from '@estruyf/vscode/dist/client';
import { ChevronRightIcon, DownloadIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { TelemetryEvent } from '../../../constants';
import { TaxonomyData } from '../../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { Page } from '../../models';
import { SettingsSelector } from '../../state';
import { NavigationBar, NavigationItem } from '../Layout';
import { PageLayout } from '../Layout/PageLayout';
import { SponsorMsg } from '../SponsorMsg';
import { TaxonomyManager } from './TaxonomyManager';

export interface ITaxonomyViewProps {
  pages: Page[];
}

export const TaxonomyView: React.FunctionComponent<ITaxonomyViewProps> = ({
  pages
}: React.PropsWithChildren<ITaxonomyViewProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const [taxonomySettings, setTaxonomySettings] = useState<TaxonomyData>();
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string | null>(`tags`);

  const onImport = () => {
    Messenger.send(DashboardMessage.importTaxonomy);
  };

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
  }, []);

  return (
    <PageLayout contentClass={`relative w-full flex-grow flex flex-col mx-auto overflow-hidden`}>
      <div className={`h-full w-full flex`}>
        <NavigationBar
          title="Select the taxonomy"
          bottom={
            <button
              className={`-mb-4 text-xs opacity-80 flex items-center text-gray-500 dark:text-whisper-900 hover:text-gray-700 dark:hover:text-whisper-500`}
              title="Import taxonomy"
              onClick={onImport}
            >
              <DownloadIcon className={`w-5 mr-2`} />
              <span>Import taxonomy</span>
            </button>
          }
        >
          <NavigationItem
            isSelected={selectedTaxonomy === 'tags'}
            onClick={() => setSelectedTaxonomy(`tags`)}
          >
            <ChevronRightIcon className="-ml-1 w-5 mr-2" />
            <span>Tags</span>
          </NavigationItem>

          <NavigationItem
            isSelected={selectedTaxonomy === 'categories'}
            onClick={() => setSelectedTaxonomy(`categories`)}
          >
            <ChevronRightIcon className="-ml-1 w-5 mr-2" />
            <span>Categories</span>
          </NavigationItem>

          {taxonomySettings?.customTaxonomy &&
            taxonomySettings.customTaxonomy.map((taxonomy, index) => (
              <NavigationItem
                key={`${taxonomy.id}-${index}`}
                isSelected={selectedTaxonomy === taxonomy.id}
                onClick={() => setSelectedTaxonomy(taxonomy.id)}
              >
                <ChevronRightIcon className="-ml-1 w-5 mr-2" />
                <span className={`first-letter:uppercase`}>{taxonomy.id}</span>
              </NavigationItem>
            ))}
        </NavigationBar>

        <div className={`w-10/12 h-full overflow-hidden`}>
          <TaxonomyManager data={taxonomySettings} taxonomy={selectedTaxonomy} pages={pages} />
        </div>
      </div>

      <SponsorMsg
        beta={settings?.beta}
        version={settings?.versionInfo}
        isBacker={settings?.isBacker}
      />
    </PageLayout>
  );
};
