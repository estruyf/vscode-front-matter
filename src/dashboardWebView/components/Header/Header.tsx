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
import { CategoryAtom, SortingAtom, TagAtom } from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { ClearFilters } from './ClearFilters';
import { MediaHeaderTop } from '../Media/MediaHeaderTop';
import { ChoiceButton } from '../ChoiceButton';
import { MediaHeaderBottom } from '../Media/MediaHeaderBottom';
import { Tabs } from './Tabs';
import { CustomScript } from '../../../models';
import { LightningBoltIcon, PlusIcon } from '@heroicons/react/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import { routePaths } from '../..';
import { useEffect } from 'react';

export interface IHeaderProps {
  header?: React.ReactNode;
  settings: Settings | null;
  
  // Navigation
  totalPages?: number;

  // Page folders
  folders?: string[];
}

export const Header: React.FunctionComponent<IHeaderProps> = ({header, totalPages, folders, settings }: React.PropsWithChildren<IHeaderProps>) => {
  const [ crntTag, setCrntTag ] = useRecoilState(TagAtom);
  const [ crntCategory, setCrntCategory ] = useRecoilState(CategoryAtom);
  const resetSorting = useResetRecoilState(SortingAtom);
  const location = useLocation();
  const navigate = useNavigate();

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
    navigate(routePaths[view]);
    resetSorting();
  }

  const runBulkScript = (script: CustomScript) => {
    Messenger.send(DashboardMessage.runCustomScript, { script });
  };

  const customActions: any[] = (settings?.scripts || []).filter(s => s.bulk && (s.type === "content" || !s.type)).map((s, idx) => ({
    title: (
      <div key={idx} className="flex items-center">
        <LightningBoltIcon className="w-4 h-4 mr-2" />
        <span>{s.title}</span>
      </div>
    ),
    onClick: () => runBulkScript(s)
  }));

  useEffect(() => {
    if (location.search) {
      const searchParams = new URLSearchParams(location.search);
      const taxonomy = searchParams.get("taxonomy");
      const value = searchParams.get("value");

      if (taxonomy && value) {
        if (taxonomy === "tags") {
          setCrntTag(value);
        } else if (taxonomy === "categories") {
          setCrntCategory(value);
        }
      }

      return;
    }

    setCrntTag("");
    setCrntCategory("");
  }, [location.search]);

  return (
    <div className={`w-full sticky top-0 z-40 bg-gray-100 dark:bg-vulcan-500`}>

      <div className="mb-0 border-b bg-gray-100 dark:bg-vulcan-500 border-gray-200 dark:border-vulcan-300">
        <Tabs onNavigate={updateView} />
      </div>

      {
        location.pathname === routePaths.contents && (
          <>
            <div className={`px-4 mt-3 mb-2 flex items-center justify-between`}>
              <Searchbox />

              <div className={`flex items-center justify-end space-x-4 flex-1`}>
                <Startup settings={settings} />
                
                <ChoiceButton 
                  title={`Create content`} 
                  choices={[
                    {
                      title: (
                        <div className='flex items-center'>
                          <PlusIcon className="w-4 h-4 mr-2" />
                          <span>Create by content type</span>
                        </div>
                      ),
                      onClick: createByContentType,
                      disabled: !settings?.initialized
                    }, {
                      title: (
                        <div className='flex items-center'>
                          <PlusIcon className="w-4 h-4 mr-2" />
                          <span>Create by template</span>
                        </div>
                      ),
                      onClick: createByTemplate,
                      disabled: !settings?.initialized
                    },
                    ...customActions
                  ]} 
                  onClick={createContent} 
                  isTemplatesEnabled={settings?.dashboardState?.contents?.templatesEnabled || undefined}
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
        location.pathname === routePaths.media && (
          <>
            <MediaHeaderTop />
            
            <MediaHeaderBottom />
          </>
        )
      }

      {
        header
      }
    </div>
  );
};