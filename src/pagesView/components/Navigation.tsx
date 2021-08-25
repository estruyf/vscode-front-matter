import * as React from 'react';
import { Tab } from '../constants/Tab';

export interface INavigationProps {
  currentTab: Tab;
  totalPages: number;
  switchTab: (tabId: Tab) => void;
}

export const tabs = [
  { name: 'All articles', id: Tab.All},
  { name: 'Published', id: Tab.Published },
  { name: 'In draft', id: Tab.Draft }
];

export const Navigation: React.FunctionComponent<INavigationProps> = ({currentTab, totalPages, switchTab}: React.PropsWithChildren<INavigationProps>) => {

  return (
    <nav className="flex-1 -mb-px flex space-x-6 xl:space-x-8" aria-label="Tabs">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          className={`${tab.id === currentTab ? `border-teal-900 dark:border-teal-300 text-teal-900 dark:text-teal-300` : `border-transparent text-gray-500 dark:text-whisper-600 hover:text-gray-700 dark:hover:text-whisper-700 hover:border-gray-300 dark:hover:border-whisper-500`} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          aria-current={tab.id === currentTab ? 'page' : undefined}
          onClick={() => switchTab(tab.id)}
        >
          {tab.name}{(tab.id === currentTab && totalPages) ? ` (${totalPages})` : ''}
        </button>
      ))}
    </nav>
  );
};