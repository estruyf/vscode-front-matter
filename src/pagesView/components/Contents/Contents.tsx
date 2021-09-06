import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { Page } from '../../models';
import { SettingsSelector } from '../../state';
import { Header } from '../Header';
import { Overview } from './Overview';
import { Spinner } from '../Spinner';
import { SponsorMsg } from '../SponsorMsg';

export interface IContentsProps {
  pages: Page[];
  loading: boolean;
}

export const Contents: React.FunctionComponent<IContentsProps> = ({pages, loading}: React.PropsWithChildren<IContentsProps>) => {
  const settings = useRecoilValue(SettingsSelector);

  const pageFolders = [...new Set(pages.map(page => page.fmFolder))];

  return (
    <main className={`h-full w-full`}>
      <div className="flex flex-col h-full overflow-auto">
        <Header 
          folders={pageFolders}
          totalPages={pages.length}
          settings={settings} />

        <div className="w-full flex-grow max-w-7xl mx-auto py-6 px-4">
          { loading ? <Spinner /> : <Overview pages={pages} settings={settings} /> }
        </div>

        <SponsorMsg version={settings?.versionInfo} />
      </div>
    </main>
  );
};