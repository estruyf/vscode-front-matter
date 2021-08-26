import * as React from 'react';
import { Spinner } from './Spinner';
import useMessages from '../hooks/useMessages';
import { Overview } from './Overview';
import { Header } from './Header';
import { Tab } from '../constants/Tab';
import { SortOption } from '../constants/SortOption';
import useDarkMode from '../../hooks/useDarkMode';
import usePages from '../hooks/usePages';

export interface IDashboardProps {}

export const Dashboard: React.FunctionComponent<IDashboardProps> = ({}: React.PropsWithChildren<IDashboardProps>) => {
  const { loading, pages, settings } = useMessages();
  const [ tab, setTab ] = React.useState(Tab.All);
  const [ sorting, setSorting ] = React.useState(SortOption.LastModified);
  const [ group, setGroup ] = React.useState<string | null>(null);
  const [ search, setSearch ] = React.useState<string | null>(null);
  const [ tag, setTag ] = React.useState<string | null>(null);
  const [ category, setCategory ] = React.useState<string | null>(null);
  const { pageItems } = usePages(pages, tab, sorting, group, search, tag, category);
  useDarkMode();

  const pageGroups = [...new Set(pages.map(page => page.fmGroup))];
  
  return (
    <main className={`h-full w-full`}>
      <div className="flex flex-col h-full overflow-auto">
        <Header currentTab={tab}
                currentSorting={sorting}
                groups={pageGroups}
                crntGroup={group}
                totalPages={pageItems.length}
                crntTag={tag}
                crntCategory={category}
                switchTab={(tabId: Tab) => setTab(tabId)}
                switchSorting={(sortId: SortOption) => setSorting(sortId)}
                switchGroup={(groupId: string | null) => setGroup(groupId)}
                switchTag={(tagId: string | null) => setTag(tagId)}
                switchCategory={(categoryId: string | null) => setCategory(categoryId)}
                onSearch={(value: string | null) => setSearch(value)}
                settings={settings}
                 />

        <div className="flex-grow max-w-7xl mx-auto py-6 px-4">
          { loading ? <Spinner /> : <Overview pages={pageItems} settings={settings} /> }
        </div>

        <p className={`text-vulcan-50 dark:text-whisper-900 py-2 text-center`}>If you find FrontMatter useful, please consider <a className={`text-vulcan-500 dark:text-whisper-500 hover:text-vulcan-600 dark:hover:text-whisper-300`} href="https://github.com/sponsors/estruyf" title="Sponsor Front Matter">sponsoring</a> it, or if you use FrontMatter for work, please encourage your employer to <a className={`text-vulcan-500 dark:text-whisper-500 hover:text-vulcan-600 dark:hover:text-whisper-300`} href="https://github.com/sponsors/estruyf" title="Sponsor Front Matter">sponsoring</a> it.</p>
      </div>
    </main>
  );
};