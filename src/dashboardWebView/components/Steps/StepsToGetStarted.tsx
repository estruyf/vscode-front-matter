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
  const isAdded = useMemo(
    () => folders.find((f) => f.path.toLowerCase() === join(wsFolder, folder).toLowerCase()),
    [folder, folders, wsFolder]
  );

  return (
    <div
      className={`text-sm flex items-center ${
        isAdded ? 'text-teal-800' : 'text-vulcan-300 dark:text-whisper-800'
      }`}
    >
      <button
        onClick={() => addFolder(folder)}
        className="mr-2 hover:text-teal-500"
        title={`Add as a content folder to Front Matter`}
      >
        {isAdded ? (
          <CheckCircleIconSolid className={`h-4 w-4`} />
        ) : (
          <CheckCircleIcon className={`h-4 w-4`} />
        )}
      </button>
      <span>{folder}</span>
    </div>
  );
};

export const StepsToGetStarted: React.FunctionComponent<IStepsToGetStartedProps> = ({
  settings
}: React.PropsWithChildren<IStepsToGetStartedProps>) => {
  const [framework, setFramework] = useState<string | null>(null);
  const [taxImported, setTaxImported] = useState<boolean>(false);

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
      name: 'Initialize project',
      description: (
        <>
          Initialize the project will create the required files and folders for using the Front
          Matter CMS. <b>Start by clicking on this action</b>.
        </>
      ),
      status: settings.initialized ? Status.Completed : Status.NotStarted,
      onClick: settings.initialized
        ? undefined
        : () => {
            Messenger.send(DashboardMessage.initializeProject);
          }
    },
    {
      id: `welcome-framework`,
      name: 'Framework presets',
      description: (
        <div>
          <div>
            Select your site-generator or framework to prefill some of the recommended settings.
          </div>

          <Menu as="div" className="relative inline-block text-left mt-4">
            <div>
              <Menu.Button className="group flex justify-center text-vulcan-500 hover:text-vulcan-600 dark:text-whisper-500 dark:hover:text-whisper-600 p-2 rounded-md border border-vulcan-400 dark:border-white">
                {framework ? framework : 'Select your framework'}
                <ChevronDownIcon
                  className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-whisper-600 dark:group-hover:text-whisper-700"
                  aria-hidden="true"
                />
              </Menu.Button>
            </div>

            <Menu.Items
              className={`w-40 origin-top-left absolute left-0 z-10 mt-2 rounded-md shadow-2xl bg-white dark:bg-vulcan-500 ring-1 ring-vulcan-400 dark:ring-white ring-opacity-5 focus:outline-none text-sm max-h-96 overflow-auto`}
            >
              <div className="py-1">
                <MenuItem
                  title={`other`}
                  value={`other`}
                  isCurrent={!framework}
                  onClick={(value) => setFrameworkAndSendMessage(value)}
                />

                <hr />

                {frameworks.map((f) => (
                  <MenuItem
                    key={f.name}
                    title={f.name}
                    value={f.name}
                    isCurrent={f.name === framework}
                    onClick={(value) => setFrameworkAndSendMessage(value)}
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
      name: 'Register content folder(s)',
      description: (
        <>
          <p>
            Add one of the folders we found in your project as a content folder. Once a folder is
            set, Front Matter can be used to list all contents and allow you to create content.
          </p>

          {settings?.dashboardState?.welcome?.contentFolders?.length > 0 && (
            <div className="mt-4">
              <div className="text-sm">Folders containing content:</div>
              <div className="mt-1 space-y-1">
                {settings?.dashboardState?.welcome?.contentFolders?.map((folder) => (
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

          <p className="mt-4 text-vulcan-300 dark:text-gray-400">
            <b>IMPORTANT</b>: You can perform this action by{' '}
            <b>right-clicking on the folder in the explorer view</b>, and selecting{' '}
            <b>register folder</b>.
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
      name: 'Import all tags and categories (optional)',
      description: (
        <>
          Now that Front Matter knows all the content folders. Would you like to import all tags and
          categories from the available content?
        </>
      ),
      status: taxImported ? Status.Completed : Status.NotStarted,
      onClick:
        settings.contentFolders && settings.contentFolders.length > 0 ? importTaxonomy : undefined
    },
    {
      id: `welcome-show-dashboard`,
      name: 'Show the dashboard',
      description: <>Once all actions are completed, the dashboard can be loaded.</>,
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
