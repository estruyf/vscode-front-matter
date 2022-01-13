import * as React from 'react';
import { Sorting } from './Sorting';
import { Searchbox } from './Searchbox';
import { Filter } from './Filter';
import { Folders } from './Folders';
import { Settings, NavigationType } from '../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { Startup } from '../Startup';
import { Navigation } from '../Navigation';
import { Grouping } from '.';
import { ViewSwitch } from './ViewSwitch';
import { useRecoilState, useResetRecoilState } from 'recoil';
import { CategoryAtom, DashboardViewAtom, SortingAtom, TagAtom } from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { ClearFilters } from './ClearFilters';
import { MediaHeaderTop } from '../Media/MediaHeaderTop';
import { ChoiceButton } from '../ChoiceButton';
import { MediaHeaderBottom } from '../Media/MediaHeaderBottom';
import { Tabs } from './Tabs';

export interface IHeaderProps {
  settings: Settings | null;
  
  // Navigation
  totalPages?: number;

  // Page folders
  folders?: string[];
}

export const Header: React.FunctionComponent<IHeaderProps> = ({totalPages, folders, settings }: React.PropsWithChildren<IHeaderProps>) => {
  const [ crntTag, setCrntTag ] = useRecoilState(TagAtom);
  const [ crntCategory, setCrntCategory ] = useRecoilState(CategoryAtom);
  const [ view, setView ] = useRecoilState(DashboardViewAtom);
  const resetSorting = useResetRecoilState(SortingAtom)

  const createContent = () => {
    Messenger.send(DashboardMessage.createContent);
  };

  const createByContentType = () => {
    Messenger.send(DashboardMessage.createByContentType);
  };

  const createByTemplate = () => {
    Messenger.send(DashboardMessage.createByTemplate);
  };

  const updateView = (view: NavigationType) => {
    setView(view);
    resetSorting();
  }

  return (
    <div className={`w-full sticky top-0 z-40 bg-gray-100 dark:bg-vulcan-500`}>

      <div className="mb-0 border-b bg-gray-100 dark:bg-vulcan-500 border-gray-200 dark:border-vulcan-300">
        <Tabs onNavigate={updateView} />
      </div>

      {
        view === NavigationType.Contents && (
          <>
            <div className={`px-4 mt-3 mb-2 flex items-center justify-between`}>
              <Searchbox />

              <div className={`flex items-center space-x-4`}>
                <Startup settings={settings} />
                
                <ChoiceButton 
                  title={`Create content`} 
                  choices={[{
                    title: `Create by content type`,
                    onClick: createByContentType,
                    disabled: !settings?.initialized
                  }, {
                    title: `Create by template`,
                    onClick: createByTemplate,
                    disabled: !settings?.initialized
                  }]} 
                  onClick={createContent} 
                  disabled={!settings?.initialized} />
              </div>
            </div>

            <div className="px-4 flex flex-row items-center border-b border-gray-200  dark:border-vulcan-100 justify-between">
              <div>
                <Navigation totalPages={totalPages || 0} />
              </div>

              <div>
                <ViewSwitch />
              </div>
            </div>

            <div className={`py-4 px-5 w-full flex items-center justify-between lg:justify-end bg-gray-200 border-b border-gray-300 dark:bg-vulcan-400  dark:border-vulcan-100 space-x-4 lg:space-x-6 xl:space-x-8`}>
              <ClearFilters />

              <Folders />

              <Filter label={`Tag`} activeItem={crntTag} items={settings?.tags || []} onClick={(value) => setCrntTag(value)} />

              <Filter label={`Category`} activeItem={crntCategory} items={settings?.categories || []} onClick={(value) => setCrntCategory(value)} />

              <Grouping />

              <Sorting view={NavigationType.Contents} />
            </div>
          </>
        )
      }

      {
        view === NavigationType.Media && (
          <>
            <MediaHeaderTop />
            
            <MediaHeaderBottom />
          </>
        )
      }
    </div>
  );
};