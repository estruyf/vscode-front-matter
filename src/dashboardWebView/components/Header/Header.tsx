import * as React from 'react';
import { Sorting } from './Sorting';
import { Searchbox } from './Searchbox';
import { Settings, NavigationType } from '../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { Grouping } from '.';
import { ViewSwitch } from './ViewSwitch';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { GroupingSelector, SortingAtom } from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { ClearFilters } from './ClearFilters';
import { MediaHeaderTop } from '../Media/MediaHeaderTop';
import { ChoiceButton } from '../Common/ChoiceButton';
import { MediaHeaderBottom } from '../Media/MediaHeaderBottom';
import { Tabs } from './Tabs';
import { CustomScript } from '../../../models';
import { ArrowTopRightOnSquareIcon, BoltIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useLocation, useNavigate } from 'react-router-dom';
import { routePaths } from '../..';
import { useEffect, useMemo } from 'react';
import { SyncButton } from './SyncButton';
import { Pagination } from './Pagination';
import { GroupOption } from '../../constants/GroupOption';
import usePagination from '../../hooks/usePagination';
import { PaginationStatus } from './PaginationStatus';
import { Navigation } from './Navigation';
import { ProjectSwitcher } from './ProjectSwitcher';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { SettingsLink } from '../SettingsView/SettingsLink';
import { Link } from '../Common/Link';
import { SPONSOR_LINK } from '../../../constants';
import { Filters } from './Filters';

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
  const grouping = useRecoilValue(GroupingSelector);
  const resetSorting = useResetRecoilState(SortingAtom);
  const location = useLocation();
  const navigate = useNavigate();
  const { pageSetNr } = usePagination(settings?.dashboardState.contents.pagination);

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
          <BoltIcon className="w-4 h-4 mr-2" />
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
              <span>{l10n.t(LocalizationKey.dashboardHeaderHeaderCreateByContentType)}</span>
            </div>
          ),
          onClick: createByContentType,
          disabled: !settings?.initialized
        },
        {
          title: (
            <div className="flex items-center">
              <PlusIcon className="w-4 h-4 mr-2" />
              <span>{l10n.t(LocalizationKey.dashboardHeaderHeaderCreateByTemplate)}</span>
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

  return (
    <div className={`w-full sticky top-0 z-20 bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)]`}>
      <div className={`mb-0 border-b flex justify-between bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] border-[var(--frontmatter-border)]`}>
        <Tabs onNavigate={updateView} />

        <div className='flex items-center space-x-2 pr-4'>
          <ProjectSwitcher />

          {
            settings?.websiteUrl && (
              <Link
                className='inline-flex items-center'
                href={settings?.websiteUrl}
                title={settings?.websiteUrl}>
                <span>{settings?.websiteUrl}</span>

                <ArrowTopRightOnSquareIcon className='w-4 h-4 ml-1' aria-hidden="true" />
              </Link>
            )
          }

          {
            !settings?.isBacker && (
              <Link
                className='inline-flex items-center text-[var(--vscode-badge-background)]'
                title={l10n.t(LocalizationKey.commonSupport)}
                href={SPONSOR_LINK}
              >
                <span className='sr-only'>{l10n.t(LocalizationKey.commonSupport)}</span>
                <HeartIcon className='w-4 h-4' aria-hidden="true" />
              </Link>
            )
          }

          <SettingsLink onNavigate={updateView} />
        </div>
      </div>

      {location.pathname === routePaths.contents && (
        <>
          <div className={`px-4 mt-3 mb-2 flex items-center justify-between`}>
            <Searchbox />

            <div className={`flex items-center justify-end space-x-4 flex-1`}>
              <SyncButton />

              <ChoiceButton
                title={l10n.t(LocalizationKey.dashboardHeaderHeaderCreateContent)}
                choices={choiceOptions}
                onClick={createContent}
                disabled={!settings?.initialized}
              />
            </div>
          </div>

          <div className={`px-4 flex flex-row items-center border-b justify-between border-[var(--frontmatter-border)]`}>
            <div>
              <Navigation totalPages={totalPages || 0} />
            </div>

            <div>
              <ViewSwitch />
            </div>
          </div>

          <div
            className={`py-4 px-5 w-full flex items-center justify-between lg:justify-end border-b space-x-4 lg:space-x-6 xl:space-x-8 bg-[var(--vscode-panel-background)] border-[var(--frontmatter-border)]`}
          >
            <ClearFilters />

            <Filters />

            <Grouping />

            <Sorting view={NavigationType.Contents} />
          </div>

          {pageSetNr > 0 &&
            (totalPages || 0) > pageSetNr &&
            (!grouping || grouping === GroupOption.none) && (
              <div
                className={`px-4 flex justify-between py-2 border-b border-[var(--frontmatter-border)]`}
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
