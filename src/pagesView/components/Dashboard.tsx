import * as React from 'react';
import { Spinner } from './Spinner';
import useMessages from '../hooks/useMessages';
import { Overview } from './Overview';
import { Header } from './Header';
import { Tab } from '../constants/Tab';
import { SortOption } from '../constants/SortOption';
import useDarkMode from '../../hooks/useDarkMode';
import usePages from '../hooks/usePages';
import { SponsorMsg } from './SponsorMsg';
import { WelcomeScreen } from './WelcomeScreen';

export interface IDashboardProps {
  showWelcome: boolean;
}

export const Dashboard: React.FunctionComponent<IDashboardProps> = ({showWelcome}: React.PropsWithChildren<IDashboardProps>) => {
  const { loading, pages, settings } = useMessages();
  const [ tab, setTab ] = React.useState(Tab.All);
  const [ sorting, setSorting ] = React.useState(SortOption.LastModified);
  const [ folder, setFolder ] = React.useState<string | null>(null);
  const [ search, setSearch ] = React.useState<string | null>(null);
  const [ tag, setTag ] = React.useState<string | null>(null);
  const [ category, setCategory ] = React.useState<string | null>(null);
  const [ group, setGroup ] = React.useState<string | null>(null);
  const { pageItems } = usePages(pages, tab, sorting, folder, search, tag, category);
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
        <Header currentTab={tab}
                currentSorting={sorting}
                folders={pageFolders}
                crntFolder={folder}
                totalPages={pageItems.length}
                crntTag={tag}
                crntCategory={category}
                crntGroup={group}
                switchTab={(tabId: Tab) => setTab(tabId)}
                switchSorting={(sortId: SortOption) => setSorting(sortId)}
                switchFolder={(folderName: string | null) => setFolder(folderName)}
                switchTag={(tagId: string | null) => setTag(tagId)}
                switchCategory={(categoryId: string | null) => setCategory(categoryId)}
                switchGroup={(groupName: string | null) => setGroup(groupName)}
                onSearch={(value: string | null) => setSearch(value)}
                settings={settings}
                 />

        <div className="flex-grow max-w-7xl mx-auto py-6 px-4">
          { loading ? <Spinner /> : <Overview pages={pageItems} settings={settings} /> }
        </div>

        <SponsorMsg />
      </div>
    </main>
  );
};