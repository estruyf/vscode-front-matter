import * as React from 'react';
import { Tab } from '../constants/Tab';
import { SortOption } from '../constants/SortOption';
import { Navigation } from './Navigation';
import { Sorting } from './Sorting';
import { Grouping } from './Grouping';
import { MessageHelper } from '../../helpers/MessageHelper';
import { DashboardMessage } from '../DashboardMessage';
import { Searchbox } from './Searchbox';
import { Settings } from '../models/Settings';

export interface IHeaderProps {
  settings: Settings;
  
  // Navigation
  currentTab: Tab;
  totalPages: number;
  switchTab: (tabId: Tab) => void;

  // Sorting
  currentSorting: SortOption;
  switchSorting: (sortId: SortOption) => void;

  // Grouping
  groups: string[];
  crntGroup: string | null;
  switchGroup: (group: string | null) => void;

  // Searching
  onSearch: (value: string | null) => void;
}

export const Header: React.FunctionComponent<IHeaderProps> = ({currentTab, currentSorting, switchSorting, switchTab, totalPages, crntGroup, groups, switchGroup, onSearch, settings}: React.PropsWithChildren<IHeaderProps>) => {

  const createContent = () => {
    MessageHelper.sendMessage(DashboardMessage.createContent);
  };

  return (
    <div className={`mb-6 sticky top-0 z-40 bg-gray-100 dark:bg-vulcan-500`}>
      <div className={`px-4 mb-2 flex items-center justify-between`}>
        <Searchbox onSearch={onSearch} />
        
        <button
          type="button"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:bg-gray-500"
          onClick={createContent}
          disabled={!settings.initialized}
        >
          Create content
        </button>
      </div>

      <div className="px-4 flex items-center border-b border-gray-200 dark:border-whisper-600">
        <Navigation currentTab={currentTab} totalPages={totalPages} switchTab={switchTab} />

        <Grouping crntGroup={crntGroup} groups={groups} switchGroup={switchGroup} />

        <Sorting currentSorting={currentSorting} switchSorting={switchSorting} />
      </div>
    </div>
  );
};