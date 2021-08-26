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
import { Startup } from './Startup';
import { Button } from './Button';
import { Filter } from './Filter';

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

  // Tags
  crntTag: string | null;
  switchTag: (tag: string | null) => void;

  // Categories
  crntCategory: string | null;
  switchCategory: (category: string | null) => void;
}

export const Header: React.FunctionComponent<IHeaderProps> = ({currentTab, currentSorting, switchSorting, switchTab, totalPages, crntGroup, groups, switchGroup, onSearch, settings, switchTag, crntTag, switchCategory, crntCategory}: React.PropsWithChildren<IHeaderProps>) => {

  const createContent = () => {
    MessageHelper.sendMessage(DashboardMessage.createContent);
  };

  return (
    <div className={`mb-6 sticky top-0 z-40 bg-gray-100 dark:bg-vulcan-500`}>
      <div className={`px-4 mb-2 flex items-center justify-between`}>
        <Searchbox onSearch={onSearch} />

        <div className={`flex items-center space-x-4`}>
          <Startup settings={settings} />
          
          <Button onClick={createContent} disabled={!settings.initialized}>Create content</Button>
        </div>
      </div>

      <div className="px-4 flex items-center border-b border-gray-200 dark:border-whisper-600">
        <Navigation currentTab={currentTab} totalPages={totalPages} switchTab={switchTab} />

        <Grouping crntGroup={crntGroup} groups={groups} switchGroup={switchGroup} />

        <Filter label={`Tag filter`} activeItem={crntTag} items={settings.tags} onClick={switchTag} />

        <Filter label={`Category filter`} activeItem={crntCategory} items={settings.categories} onClick={switchCategory} />

        <Sorting currentSorting={currentSorting} switchSorting={switchSorting} />
      </div>
    </div>
  );
};