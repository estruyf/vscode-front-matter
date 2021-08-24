import * as React from 'react';
import { Spinner } from './Spinner';
import useMessages from '../hooks/useMessages';
import { Overview } from './Overview';
import { Header } from './Header';
import { Tab } from '../constants/Tab';
import { SortOption } from '../constants/SortOption';

export interface IDashboardProps {}

export const Dashboard: React.FunctionComponent<IDashboardProps> = (props: React.PropsWithChildren<IDashboardProps>) => {
  const { loading, pages } = useMessages();
  const [ tab, setTab ] = React.useState(Tab.All);
  const [ sorting, setSorting ] = React.useState(SortOption.LastModified);

  let pagesToShow = pages;
  if (tab === Tab.Published) {
    pagesToShow = pages.filter(page => !page.draft);
  } else if (tab === Tab.Draft) {
    pagesToShow = pages.filter(page => !!page.draft);
  } else {
    pagesToShow = pages;
  }

  let pagesSorted = pagesToShow;
  if (sorting === SortOption.FileNameAsc) {
    pagesSorted = pagesToShow.sort((a, b) => a.fmFileName.toLowerCase().localeCompare(b.fmFileName.toLowerCase()));
  } else if (sorting === SortOption.FileNameDesc) {
    pagesSorted = pagesToShow.sort((a, b) => b.fmFileName.toLowerCase().localeCompare(a.fmFileName.toLowerCase()));
  } else {
    pagesSorted = pagesToShow.sort((a, b) => b.fmModified - a.fmModified);
  }

  // Show draft/published
  // Filter by draft
  // Filter by folder (if multiple)
  // TODO: Sort by last modified
  
  return (
    <main className="h-full w-full">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Header currentTab={tab}
                currentSorting={sorting}
                switchTab={(tabId: Tab) => setTab(tabId)}
                switchSorting={(sortId: SortOption) => setSorting(sortId)}
                 />
          
        <Overview pages={pagesSorted} />
      </div>

      { loading ? <Spinner /> : null }
    </main>
  );
};