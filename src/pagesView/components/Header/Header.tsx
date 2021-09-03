import * as React from 'react';
import { Sorting } from './Sorting';
import { Searchbox } from './Searchbox';
import { Filter } from './Filter';
import { Folders } from './Folders';
import { Settings } from '../../models';
import { Tab } from '../../constants/Tab';
import { SortOption } from '../../constants/SortOption';
import { MessageHelper } from '../../../helpers/MessageHelper';
import { DashboardMessage } from '../../DashboardMessage';
import { Startup } from '../Startup';
import { Button } from '../Button';
import { Navigation } from '../Navigation';
import { Grouping } from '.';
import { GroupOption } from '../../constants/GroupOption';

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
  folders: string[];
  crntFolder: string | null;
  switchFolder: (folderName: string | null) => void;

  // Searching
  onSearch: (value: string | null) => void;

  // Tags
  crntTag: string | null;
  switchTag: (tag: string | null) => void;

  // Categories
  crntCategory: string | null;
  switchCategory: (category: string | null) => void;

  // Grouping
  crntGroup: GroupOption;
  switchGroup: (groupId: GroupOption) => void;
}

export const Header: React.FunctionComponent<IHeaderProps> = ({currentTab, currentSorting, switchSorting, switchTab, totalPages, crntFolder, folders, switchFolder, onSearch, settings, switchTag, crntTag, switchCategory, crntCategory, crntGroup, switchGroup}: React.PropsWithChildren<IHeaderProps>) => {

  const createContent = () => {
    MessageHelper.sendMessage(DashboardMessage.createContent);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto sticky top-0 z-40 bg-gray-100 dark:bg-vulcan-500`}>
      <div className={`px-4 my-2 flex items-center justify-between`}>
        <Searchbox onSearch={onSearch} />

        <div className={`flex items-center space-x-4`}>
          <Startup settings={settings} />
          
          <Button onClick={createContent} disabled={!settings.initialized}>Create content</Button>
        </div>
      </div>

      <div className="px-4 flex flex-col lg:flex-row items-center border-b border-gray-200 dark:border-whisper-600">
        <div className={`w-full`}>
          <Navigation currentTab={currentTab} totalPages={totalPages} switchTab={switchTab} />
        </div>

        <div className={`my-4 lg:my-0 w-full flex items-center justify-between order-first lg:order-last `}>
          <Folders crntFolder={crntFolder} folders={folders} switchFolder={switchFolder} />

          <Filter label={`Tag filter`} activeItem={crntTag} items={settings.tags} onClick={switchTag} />

          <Filter label={`Category filter`} activeItem={crntCategory} items={settings.categories} onClick={switchCategory} />

          <Grouping group={crntGroup} switchGroup={switchGroup} />

          <Sorting currentSorting={currentSorting} switchSorting={switchSorting} />
        </div>
      </div>
    </div>
  );
};