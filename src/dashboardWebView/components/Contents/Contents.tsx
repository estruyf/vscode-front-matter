import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { Page } from '../../models';
import { SettingsSelector } from '../../state';
import { Header } from '../Header';
import { Overview } from './Overview';
import { Spinner } from '../Spinner';
import { SponsorMsg } from '../SponsorMsg';
import usePages from '../../hooks/usePages';

export interface IContentsProps {
  pages: Page[];
  loading: boolean;
}

export const Contents: React.FunctionComponent<IContentsProps> = ({pages, loading}: React.PropsWithChildren<IContentsProps>) => {
  const settings = useRecoilValue(SettingsSelector);
  const { pageItems } = usePages(pages);

  const pageFolders = [...new Set(pageItems.map(page => page.fmFolder))];

  return (
    <main className={`h-full w-full`}>
      <div className="flex flex-col h-full overflow-auto">
        <Header 
          folders={pageFolders}
          totalPages={pageItems.length}
          settings={settings} />

        <div className="w-full flex-grow max-w-7xl mx-auto py-6 px-4">
          { loading ? <Spinner /> : <Overview pages={pageItems} settings={settings} /> }
        </div>

        <SponsorMsg beta={settings?.beta} version={settings?.versionInfo} />
      </div>
    </main>
  );
};