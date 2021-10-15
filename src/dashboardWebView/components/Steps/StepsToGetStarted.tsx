import * as React from 'react';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { Settings } from '../../models/Settings';
import { Status } from '../../models/Status';
import { Step } from './Step';
import { useState } from 'react';
import { Menu } from '@headlessui/react';
import { MenuItem } from '../Menu';
import { Framework } from '../../../models';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { FrameworkDetectors } from '../../../constants/FrameworkDetectors';

export interface IStepsToGetStartedProps {
  settings: Settings;
}

export const StepsToGetStarted: React.FunctionComponent<IStepsToGetStartedProps> = ({settings}: React.PropsWithChildren<IStepsToGetStartedProps>) => {
  const [framework, setFramework] = useState<string | null>(null);

  const frameworks: Framework[] = FrameworkDetectors.map((detector: any) => detector.framework);

  const setFrameworkAndSendMessage = (framework: string) => {
    setFramework(framework);
    Messenger.send(DashboardMessage.setFramework, framework);
  }

  const steps = [
    { 
      name: 'Initialize project', 
      description: <>Initialize the project with a template folder and sample markdown file. The template folder can be used to define your own templates. <b>Start by clicking on this action</b>.</>,
      status: settings.initialized ? Status.Completed : Status.NotStarted,
      onClick: settings.initialized ? undefined : () => { Messenger.send(DashboardMessage.initializeProject); }  
    },
    { 
      name: 'Framework presets', 
      description: (
        <div>
          <div>Select your site-generator or framework to prefill some of the recommended settings.</div>

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

            <Menu.Items className={`w-40 origin-top-left absolute left-0 z-10 mt-2 rounded-md shadow-2xl bg-white dark:bg-vulcan-500 ring-1 ring-vulcan-400 dark:ring-white ring-opacity-5 focus:outline-none text-sm max-h-96 overflow-auto`}>
              <div className="py-1">
                <MenuItem 
                  title={`other`}
                  value={`other`}
                  isCurrent={!framework}
                  onClick={(value) => setFrameworkAndSendMessage(value)} />
                
                <hr />

                {frameworks.map((f) => (
                  <MenuItem 
                    key={f.name}
                    title={f.name}
                    value={f.name}
                    isCurrent={f.name === framework}
                    onClick={(value) => setFrameworkAndSendMessage(value)} />
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
      name: 'Register content folders (manual action)',
      description: <>Register your content folder(s). You can perform this action by right-clicking on the folder in the explorer view, and selecting <b>register folder</b>. Once a folder is set, Front Matter can be used to list all contents and allow you to create content.</>,
      status: settings.folders && settings.folders.length > 0 ? Status.Completed : Status.NotStarted
    },
    {
      name: 'Show the dashboard',
      description: <>Once both actions are completed, click on this action to load the dashboard.</>,
      status: (settings.initialized && settings.folders && settings.folders.length > 0) ? Status.Active : Status.NotStarted,
      onClick: (settings.initialized && settings.folders && settings.folders.length > 0) ? () => { Messenger.send(DashboardMessage.reload); } : undefined
    }
  ];
  
  React.useEffect(() => {
    if (settings.crntFramework) {
      setFramework(settings.crntFramework);
    }
  }, [settings.crntFramework]);

  return (
    <nav aria-label="Progress">
      <ol role="list">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'pb-10' : ''} relative`}>
            <Step name={step.name} description={step.description} status={step.status} showLine={stepIdx !== steps.length - 1} onClick={step.onClick} />
          </li>
        ))}
      </ol>
    </nav>
  );
};