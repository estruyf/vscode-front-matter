import * as React from 'react';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { Settings } from '../../models/Settings';
import { Status } from '../../models/Status';
import { Step } from './Step';
import { useMemo, useState } from 'react';
import { Menu } from '@headlessui/react';
import { MenuItem } from '../Menu';
import { ContentFolder, Framework } from '../../../models';
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/solid';
import { FrameworkDetectors } from '../../../constants/FrameworkDetectors';
import { join } from 'path';
import useThemeColors from '../../hooks/useThemeColors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface IStepsToGetStartedProps {
  settings: Settings;
}

const Folder = ({
  wsFolder,
  folder,
  folders,
  addFolder
}: {
  wsFolder: string;
  folder: string;
  folders: ContentFolder[];
  addFolder: (folder: string) => void;
}) => {
  const { getColors } = useThemeColors();

  const isAdded = useMemo(
    () => folders.find((f) => f.path.toLowerCase() === join(wsFolder, folder).toLowerCase()),
    [folder, folders, wsFolder]
  );

  return (
    <div
      className={`text-sm flex items-center ${isAdded ? getColors('text-teal-800', 'text-[var(--vscode-textLink-foreground)]') : getColors('text-vulcan-300 dark:text-whisper-800', '')
        }`}
    >
      <button
        onClick={() => addFolder(folder)}
        className={`mr-2 flex gap-2 items-center ${getColors('hover:text-teal-500', 'hover:text-[var(--vscode-textLink-activeForeground)]')}`}
        title={l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedButtonAddFolderTitle)}
      >
        {isAdded ? (
          <CheckCircleIconSolid className={`h-4 w-4`} />
        ) : (
          <CheckCircleIcon className={`h-4 w-4`} />
        )}
        <span>{folder}</span>
      </button>
    </div>
  );
};

export const StepsToGetStarted: React.FunctionComponent<IStepsToGetStartedProps> = ({
  settings
}: React.PropsWithChildren<IStepsToGetStartedProps>) => {
  const [framework, setFramework] = useState<string | null>(null);
  const [taxImported, setTaxImported] = useState<boolean>(false);
  const { getColors } = useThemeColors();

  const frameworks: Framework[] = FrameworkDetectors.map((detector: any) => detector.framework);

  const setFrameworkAndSendMessage = (framework: string) => {
    setFramework(framework);
    Messenger.send(DashboardMessage.setFramework, framework);
  };

  const addFolder = (folder: string) => {
    Messenger.send(DashboardMessage.addFolder, folder);
  };

  const reload = () => {
    const crntState: any = Messenger.getState() || {};

    Messenger.setState({
      ...crntState,
      isWelcomeConfiguring: false
    });

    Messenger.send(DashboardMessage.reload);
  };

  const importTaxonomy = () => {
    Messenger.send(DashboardMessage.importTaxonomy);
    setTaxImported(true);
  };

  const steps = [
    {
      id: `welcome-init`,
      name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedInitializeProjectName),
      description: <>{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedInitializeProjectDescription)}</>,
      status: settings.initialized ? Status.Completed : Status.NotStarted,
      onClick: settings.initialized
        ? undefined
        : () => {
          Messenger.send(DashboardMessage.initializeProject);
        }
    },
    {
      id: `welcome-framework`,
      name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedFrameworkName),
      description: (
        <div>
          <div>
            {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedFrameworkDescription)}
          </div>

          <Menu as="div" className="relative inline-block text-left mt-4">
            <div>
              <Menu.Button className={`group flex justify-center p-2 rounded-md border ${getColors(
                'text-vulcan-500 hover:text-vulcan-600 dark:text-whisper-500 dark:hover:text-whisper-600 border-vulcan-400 dark:border-white',
                'text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)]'
              )
                }`}>
                {framework ? framework : l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedFrameworkSelect)}
                <ChevronDownIcon
                  className={`flex-shrink-0 -mr-1 ml-1 h-5 w-5 ${getColors(
                    'text-gray-400 group-hover:text-gray-500 dark:text-whisper-600 dark:group-hover:text-whisper-700',
                    ''
                  )
                    }`}
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>

            <Menu.Items
              className={`w-40 origin-top-left absolute left-0 z-10 mt-2 rounded-md shadow-2xl ring-1 ring-opacity-5 focus:outline-none text-sm max-h-96 overflow-auto ${getColors(
                'bg-white dark:bg-vulcan-500 ring-vulcan-400 dark:ring-white',
                'bg-[var(--vscode-sideBar-background)] ring-[var(--frontmatter-border)]'
              )
                }`}
            >
              <div className="py-1">
                <MenuItem
                  title={l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedFrameworkSelectOther)}
                  value={`other`}
                  isCurrent={!framework}
                  onClick={(value: string) => setFrameworkAndSendMessage(value)}
                />

                <hr className={`border-[var(--frontmatter-border)]`} />

                {frameworks.map((f) => (
                  <MenuItem
                    key={f.name}
                    title={f.name}
                    value={f.name}
                    isCurrent={f.name === framework}
                    onClick={(value: string) => setFrameworkAndSendMessage(value)}
                  />
                ))}
              </div>
            </Menu.Items>
          </Menu>
        </div>
      ),
      status: settings.crntFramework ? Status.Completed : Status.NotStarted,
      onClick: undefined
    },
    {
      id: `welcome-content-folders`,
      name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedContentFoldersName),
      description: (
        <>
          <p>
            {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedContentFoldersDescription)}
          </p>

          {settings?.dashboardState?.welcome?.contentFolders?.length > 0 && (
            <div className="mt-4">
              <div className="text-sm">{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedContentFoldersLabel)}</div>
              <div className="mt-1 space-y-1">
                {settings?.dashboardState?.welcome?.contentFolders?.map((folder: string) => (
                  <Folder
                    key={folder}
                    folder={folder}
                    addFolder={addFolder}
                    wsFolder={settings.wsFolder}
                    folders={settings.contentFolders}
                  />
                ))}
              </div>
            </div>
          )}

          <p className={`mt-4 ${getColors('text-vulcan-300 dark:text-gray-400', '')}`}>
            <b>{l10n.t(LocalizationKey.commonInformation)}</b>: {l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedContentFoldersInformationDescription)}.
          </p>
        </>
      ),
      status:
        settings.contentFolders && settings.contentFolders.length > 0
          ? Status.Completed
          : Status.NotStarted
    },
    {
      id: `welcome-import`,
      name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedTagsName),
      description: <>{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedTagsDescription)}</>,
      status: taxImported ? Status.Completed : Status.NotStarted,
      onClick:
        settings.contentFolders && settings.contentFolders.length > 0 ? importTaxonomy : undefined
    },
    {
      id: `welcome-show-dashboard`,
      name: l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedShowDashboardName),
      description: <>{l10n.t(LocalizationKey.dashboardStepsStepsToGetStartedShowDashboardDescription)}</>,
      status:
        settings.initialized && settings.contentFolders && settings.contentFolders.length > 0
          ? Status.Active
          : Status.NotStarted,
      onClick:
        settings.initialized && settings.contentFolders && settings.contentFolders.length > 0
          ? reload
          : undefined
    }
  ];

  React.useEffect(() => {
    if (settings.crntFramework || settings.framework?.name) {
      setFramework(settings.crntFramework || settings.framework?.name || null);
    }
  }, [settings.crntFramework, settings.framework]);

  return (
    <nav aria-label="Progress">
      <ol role="list">
        {steps.map((step, stepIdx) => (
          <li
            key={step.id}
            className={`${stepIdx !== steps.length - 1 ? 'pb-10' : ''} relative`}
            data-test={step.id}
          >
            <Step
              name={step.name}
              description={step.description}
              status={step.status}
              showLine={stepIdx !== steps.length - 1}
              onClick={step.onClick}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
};
