import * as React from 'react';
import { Spinner } from './Spinner';
import useMessages from '../hooks/useMessages';
import { Overview } from './Overview';
import { Header } from './Header';
import { Tab } from '../constants/Tab';
import { SortOption } from '../constants/SortOption';
import Fuse from 'fuse.js';
import { Page } from '../models/Page';
import useDarkMode from '../../hooks/useDarkMode';

export interface IDashboardProps {}

// TODO: Filter by tag / category

const fuseOptions: Fuse.IFuseOptions<Page> = {
  keys: [
    "title",
    "slug",
    "description",
    "fmFileName"
  ]
};

export const Dashboard: React.FunctionComponent<IDashboardProps> = ({}: React.PropsWithChildren<IDashboardProps>) => {
  const { loading, pages, settings } = useMessages();
  const [ tab, setTab ] = React.useState(Tab.All);
  const [ sorting, setSorting ] = React.useState(SortOption.LastModified);
  const [ group, setGroup ] = React.useState<string | null>(null);
  const [ search, setSearch ] = React.useState<string | null>(null);
  const [ pageItems, setPageItems ] = React.useState<Page[]>([]);
  useDarkMode();

  React.useEffect(() => {
    // Check if search needs to be performed
    let searchedPages = pages;
    if (search) {
      const fuse = new Fuse(pages, fuseOptions);
      const results = fuse.search(search);
      searchedPages = results.map(page => page.item);
    }

    // Filter the pages
    let pagesToShow = searchedPages;
    if (tab === Tab.Published) {
      pagesToShow = searchedPages.filter(page => !page.draft);
    } else if (tab === Tab.Draft) {
      pagesToShow = searchedPages.filter(page => !!page.draft);
    } else {
      pagesToShow = searchedPages;
    }

    // Sort the pages
    let pagesSorted = pagesToShow;
    if (sorting === SortOption.FileNameAsc) {
      pagesSorted = pagesToShow.sort((a, b) => a.fmFileName.toLowerCase().localeCompare(b.fmFileName.toLowerCase()));
    } else if (sorting === SortOption.FileNameDesc) {
      pagesSorted = pagesToShow.sort((a, b) => b.fmFileName.toLowerCase().localeCompare(a.fmFileName.toLowerCase()));
    } else {
      pagesSorted = pagesToShow.sort((a, b) => b.fmModified - a.fmModified);
    }

    if (group) {
      pagesSorted = pagesSorted.filter(page => page.fmGroup === group);
    }

    setPageItems(pagesSorted);
  }, [ pages, tab, sorting, group, search ]);

  const pageGroups = [...new Set(pages.map(page => page.fmGroup))];
  
  return (
    <main className={`h-full w-full`}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Header currentTab={tab}
                currentSorting={sorting}
                groups={pageGroups}
                crntGroup={group}
                totalPages={pageItems.length}
                switchTab={(tabId: Tab) => setTab(tabId)}
                switchSorting={(sortId: SortOption) => setSorting(sortId)}
                switchGroup={(groupId: string | null) => setGroup(groupId)}
                onSearch={(value: string | null) => setSearch(value)}
                settings={settings}
                 />

        { loading ? <Spinner /> : <Overview pages={pageItems} settings={settings} /> }
      </div>
    </main>
  );
};