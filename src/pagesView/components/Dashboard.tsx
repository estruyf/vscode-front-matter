import * as React from 'react';
import { Spinner } from './Spinner';
import useMessages from '../hooks/useMessages';
import { Overview } from './Overview';
import { Header } from './Header';
import useDarkMode from '../../hooks/useDarkMode';
import usePages from '../hooks/usePages';
import { SponsorMsg } from './SponsorMsg';
import { WelcomeScreen } from './WelcomeScreen';

export interface IDashboardProps {
  showWelcome: boolean;
}

export const Dashboard: React.FunctionComponent<IDashboardProps> = ({showWelcome}: React.PropsWithChildren<IDashboardProps>) => {
  const { loading, pages, settings } = useMessages();
  const { pageItems } = usePages(pages);
  useDarkMode();

  const pageFolders = [...new Set(pages.map(page => page.fmFolder))];

  if (!settings) {
    return <Spinner />;
  }

  if (showWelcome) {
    return <WelcomeScreen settings={settings} />;
  }

  if (!settings.initialized || settings.folders?.length === 0) {
    return <WelcomeScreen settings={settings} />;
  }
  
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

        <SponsorMsg />
      </div>
    </main>
  );
};