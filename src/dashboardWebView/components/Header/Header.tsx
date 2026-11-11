import * as React from 'react';
import { Sorting } from './Sorting';
import { Searchbox } from './Searchbox';
import { Settings, NavigationType } from '../../models';
import { DashboardMessage } from '../../DashboardMessage';
import { Grouping } from '.';
import { ViewSwitch } from './ViewSwitch';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { AllPagesAtom, LastSyncAtom, MultiSelectedItemsAtom, SortingAtom } from '../../state';
import { Messenger } from '@estruyf/vscode/dist/client';
import { ClearFilters } from './ClearFilters';
import { MediaHeaderTop } from '../Media/MediaHeaderTop';
import { ChoiceButton } from '../Common/ChoiceButton';
import { MediaHeaderBottom } from '../Media/MediaHeaderBottom';
import { Tabs } from './Tabs';
import { CustomScript } from '../../../models';
import { ArrowTopRightOnSquareIcon, BoltIcon, BookOpenIcon, PlusIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';
import { useLocation, useNavigate } from 'react-router-dom';
import { routePaths } from '../..';
import { useMemo } from 'react';
import { Navigation } from './Navigation';
import { ProjectSwitcher } from './ProjectSwitcher';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';
import { SettingsLink } from '../SettingsView/SettingsLink';
import { Link } from '../Common/Link';
import { COMMAND_NAME, GeneralCommands, SPONSOR_LINK } from '../../../constants';
import { Filters } from './Filters';
import { ActionsBar } from './ActionsBar';
import { RefreshDashboardData } from './RefreshDashboardData';
import { useRelativeTime } from '../../hooks/useRelativeTime';

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
  settings
}: React.PropsWithChildren<IHeaderProps>) => {
  const resetSorting = useResetRecoilState(SortingAtom);
  const resetSelectedItems = useResetRecoilState(MultiSelectedItemsAtom);
  const location = useLocation();
  const navigate = useNavigate();
  const allPages = useRecoilValue(AllPagesAtom);
  const lastSync = useRecoilValue(LastSyncAtom);
  const syncLabel = useRelativeTime(lastSync);

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
    resetSelectedItems();
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
  }, [settings?.dashboardState?.contents?.templatesEnabled, settings?.scripts]);

  return (
    <div className={`w-full sticky top-0 z-20 bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)]`}>
      <div className={`px-4 overflow-x-auto mb-0 border-b flex justify-between bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] border-[var(--frontmatter-border)]`}>
        <Tabs onNavigate={updateView} />

        <div className='flex items-center space-x-2'>
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

          <button
            className="inline-flex items-center hover:text-[var(--vscode-textLink-activeForeground)]"
            title={l10n.t(LocalizationKey.commonDocs)}
            onClick={() => Messenger.send(GeneralCommands.toVSCode.runCommand, {
              command: COMMAND_NAME.docs
            })}>
            <span className='sr-only'>{l10n.t(LocalizationKey.commonDocs)}</span>
            <BookOpenIcon className='w-4 h-4' aria-hidden="true" />
          </button>

          <SettingsLink onNavigate={updateView} />
        </div>
      </div>

      {location.pathname === routePaths.contents && (
        <>
          {/* Title row: heading + count/sync status | search + create */}
          <div className={`px-4 py-2 flex items-center justify-between gap-4`}>
            <div className={`flex flex-col min-w-0`}>
              <h1 className={`text-lg font-semibold leading-tight`} style={{ color: 'var(--fm-text-hi)' }}>
                {l10n.t(LocalizationKey.dashboardHeaderTabsContents)}
              </h1>
              <div className={`flex items-center gap-2 flex-wrap`} style={{ color: 'var(--fm-text-lo)' }}>
                {allPages.length > 0 && (
                  <p className={`text-xs leading-tight mt-0.5`} style={{ fontFamily: 'var(--fm-mono)', color: 'var(--fm-text-lo)' }}>
                    {allPages.length} {allPages.length === 1 ? 'item' : 'items'}
                    {syncLabel ? <> &middot; synced {syncLabel}</> : null}
                    {` `}&middot;{` `}
                  </p>
                )}
                <RefreshDashboardData />
              </div>
            </div>

            <div className={`flex items-center gap-2 flex-shrink-0`}>
              <Searchbox placeholder={l10n.t(LocalizationKey.commonSearch) + ' content...'} />

              <ChoiceButton
                title={l10n.t(LocalizationKey.dashboardHeaderHeaderCreateContent)}
                choices={choiceOptions}
                onClick={createContent}
                disabled={!settings?.initialized}
              />
            </div>
          </div>

          {/* Combined filter row: nav tabs | filters + grouping + sorting + view switch */}
          <div className={`overflow-x-auto px-4 py-1.5 flex items-center justify-between gap-2 border-b border-[var(--frontmatter-border)]`}>
            <Navigation />

            <div className={`flex items-center gap-4 flex-shrink-0`}>
              <ClearFilters />

              <Filters />

              <Grouping />

              <Sorting view={NavigationType.Contents} />

              <div className="h-5 w-px flex-shrink-0" style={{ backgroundColor: 'var(--frontmatter-border)' }} aria-hidden="true" />

              <ViewSwitch />
            </div>
          </div>

          <ActionsBar view={NavigationType.Contents} />
        </>
      )}

      {location.pathname === routePaths.media && (
        <>
          <MediaHeaderTop />

          <MediaHeaderBottom />

          <ActionsBar view={NavigationType.Media} />
        </>
      )}

      {header}
    </div>
  );
};
