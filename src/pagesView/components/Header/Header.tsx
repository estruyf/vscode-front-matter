import * as React from 'react';
import { Sorting } from './Sorting';
import { Searchbox } from './Searchbox';
import { Filter } from './Filter';
import { Folders } from './Folders';
import { Settings } from '../../models';
import { MessageHelper } from '../../../helpers/MessageHelper';
import { DashboardMessage } from '../../DashboardMessage';
import { Startup } from '../Startup';
import { Button } from '../Button';
import { Navigation } from '../Navigation';
import { Grouping } from '.';
import { ViewSwitch } from './ViewSwitch';
import { useRecoilState } from 'recoil';
import { CategoryAtom, TagAtom } from '../../state';

export interface IHeaderProps {
  settings: Settings;
  
  // Navigation
  totalPages: number;

  // Page folders
  folders: string[];
}

export const Header: React.FunctionComponent<IHeaderProps> = ({totalPages, folders, settings }: React.PropsWithChildren<IHeaderProps>) => {
  const [ crntTag, setCrntTag ] = useRecoilState(TagAtom);
  const [ crntCategory, setCrntCategory ] = useRecoilState(CategoryAtom);

  const createContent = () => {
    MessageHelper.sendMessage(DashboardMessage.createContent);
  };

  return (
    <div className={`w-full max-w-7xl mx-auto sticky top-0 z-40 bg-gray-100 dark:bg-vulcan-500`}>
      <div className={`px-4 my-2 flex items-center justify-between`}>
        <Searchbox />

        <div className={`flex items-center space-x-4`}>
          <Startup settings={settings} />
          
          <Button onClick={createContent} disabled={!settings.initialized}>Create content</Button>
        </div>
      </div>

      <div className="px-4 flex flex-col lg:flex-row items-center border-b border-gray-200 dark:border-whisper-600">
        <div className={`w-full lg:w-auto`}>
          <Navigation totalPages={totalPages} />
        </div>

        <div className={`my-4 lg:my-0 w-full flex items-center justify-between lg:justify-end space-x-4 lg:space-x-6 xl:space-x-8 order-first lg:order-last`}>
          <Folders folders={folders} />

          <Filter label={`Tag filter`} activeItem={crntTag} items={settings.tags} onClick={(value) => setCrntTag(value)} />

          <Filter label={`Category filter`} activeItem={crntCategory} items={settings.categories} onClick={(value) => setCrntCategory(value)} />

          <Grouping />

          <Sorting />

          <ViewSwitch />
        </div>
      </div>
    </div>
  );
};