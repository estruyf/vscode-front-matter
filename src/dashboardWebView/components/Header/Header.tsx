import * as React from 'react';
import { Sorting } from './Sorting';
import { Searchbox } from './Searchbox';
import { Filter } from './Filter';
import { Folders } from './Folders';
import { Settings, NavigationType } from '../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { Grouping } from '.';
import { ViewSwitch } from './ViewSwitch';
import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { CategoryAtom, GroupingSelector, SortingAtom, TagAtom } from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { ClearFilters } from './ClearFilters';
import { MediaHeaderTop } from '../Media/MediaHeaderTop';
import { ChoiceButton } from '../Common/ChoiceButton';
import { MediaHeaderBottom } from '../Media/MediaHeaderBottom';
import { Tabs } from './Tabs';
import { CustomScript } from '../../../models';
import { LightningBoltIcon, PlusIcon } from '@heroicons/react/outline';
import { useLocation, useNavigate } from 'react-router-dom';
import { routePaths } from '../..';
import { useEffect, useMemo } from 'react';
import { SyncButton } from './SyncButton';
import { Pagination } from './Pagination';
import { GroupOption } from '../../constants/GroupOption';
import usePagination from '../../hooks/usePagination';
import { PaginationStatus } from './PaginationStatus';
import useThemeColors from '../../hooks/useThemeColors';
import { Startup } from './Startup';
import { Navigation } from './Navigation';
import { ProjectSwitcher } from './ProjectSwitcher';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IHeaderProps {
  header?: React.ReactNode;
  settings: Settings | null;

  // Navigation
  totalPages?: number;

  // Page folders
  folders?: string[];
}

export const Header: React.FunctionComponent<IHeaderProps> = ({
  header,
  totalPages,
  settings
}: React.PropsWithChildren<IHeaderProps>) => {
  const [crntTag, setCrntTag] = useRecoilState(TagAtom);
  const [crntCategory, setCrntCategory] = useRecoilState(CategoryAtom);
  const grouping = useRecoilValue(GroupingSelector);
  const resetSorting = useResetRecoilState(SortingAtom);
  const location = useLocation();
  const navigate = useNavigate();
  const { pageSetNr } = usePagination(settings?.dashboardState.contents.pagination);
  const { getColors } = useThemeColors();

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
  };

  const runBulkScript = (script: CustomScript) => {
    Messenger.send(DashboardMessage.runCustomScript, { script });
  };

  const customActions: any[] = (settings?.scripts || [])
    .filter((s) => s.bulk && (s.type === 'content' || !s.type))
    .map((s, idx) => ({
      title: (
        <div key={idx} className="flex items-center">
          <LightningBoltIcon className="w-4 h-4 mr-2" />
          <span>{s.title}</span>
        </div>
      ),
      onClick: () => runBulkScript(s)
    }));

  const choiceOptions = useMemo(() => {
    const isEnabled = settings?.dashboardState?.contents?.templatesEnabled || false;

    if (isEnabled) {
      return [
        {
          title: (
            <div className="flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Create by content type</span>
            </div>
          ),
          onClick: createByContentType,
          disabled: !settings?.initialized
        },
        {
          title: (
            <div className="flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>Create by template</span>
            </div>
          ),
          onClick: createByTemplate,
          disabled: !settings?.initialized
        },
        ...customActions
      ];
    }

    return [];
  }, [settings?.dashboardState?.contents?.templatesEnabled]);

  useEffect(() => {
    if (location.search) {
      const searchParams = new URLSearchParams(location.search);
      const taxonomy = searchParams.get('taxonomy');
      const value = searchParams.get('value');

      if (taxonomy && value) {
        if (taxonomy === 'tags') {
          setCrntTag(value);
        } else if (taxonomy === 'categories') {
          setCrntCategory(value);
        }
      }

      return;
    }

    setCrntTag('');
    setCrntCategory('');
  }, [location.search]);

  return (
    <div className={`w-full sticky top-0 z-20 ${getColors(
      `bg-gray-100 dark:bg-vulcan-500`,
      `bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)]`
    )
      }`}>
      <div className={`mb-0 border-b flex justify-between ${getColors(
        `bg-gray-100 dark:bg-vulcan-500 border-gray-200 dark:border-vulcan-300`,
        `bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] border-[var(--vscode-editorWidget-border)]`
      )
        }`}>
        <Tabs onNavigate={updateView} />

        <ProjectSwitcher />
      </div>

      {location.pathname === routePaths.contents && (
        <>
          <div className={`px-4 mt-3 mb-2 flex items-center justify-between`}>
            <Searchbox />

            <div className={`flex items-center justify-end space-x-4 flex-1`}>
              <Startup settings={settings} />

              <SyncButton />

              <ChoiceButton
                title={l10n.t(LocalizationKey.dashboardHeaderCreateContent)}
                choices={choiceOptions}
                onClick={createContent}
                disabled={!settings?.initialized}
              />
            </div>
          </div>

          <div className={`px-4 flex flex-row items-center border-b justify-between ${getColors(`border-gray-200 dark:border-vulcan-100`, `border-[var(--vscode-editorWidget-border)]`)
            }`}>
            <div>
              <Navigation totalPages={totalPages || 0} />
            </div>

            <div>
              <ViewSwitch />
            </div>
          </div>

          <div
            className={`py-4 px-5 w-full flex items-center justify-between lg:justify-end border-b space-x-4 lg:space-x-6 xl:space-x-8 ${getColors(`bg-gray-200 border-gray-300 dark:bg-vulcan-400 dark:border-vulcan-100`, `bg-[var(--vscode-panel-background)] border-[var(--vscode-editorWidget-border)]`)
              }`}
          >
            <ClearFilters />

            <Folders />

            <Filter
              label={`Tag`}
              activeItem={crntTag}
              items={settings?.tags || []}
              onClick={(value) => setCrntTag(value)}
            />

            <Filter
              label={`Category`}
              activeItem={crntCategory}
              items={settings?.categories || []}
              onClick={(value) => setCrntCategory(value)}
            />

            <Grouping />

            <Sorting view={NavigationType.Contents} />
          </div>

          {pageSetNr > 0 &&
            (totalPages || 0) > pageSetNr &&
            (!grouping || grouping === GroupOption.none) && (
              <div
                className={`px-4 flex justify-between py-2 border-b ${getColors(`border-gray-300 dark:border-vulcan-100`, `border-[var(--vscode-editorWidget-border)]`)
                  }`}
              >
                <PaginationStatus totalPages={totalPages || 0} />

                <Pagination totalPages={totalPages || 0} />
              </div>
            )}
        </>
      )}

      {location.pathname === routePaths.media && (
        <>
          <MediaHeaderTop />

          <MediaHeaderBottom />
        </>
      )}

      {header}
    </div>
  );
};
