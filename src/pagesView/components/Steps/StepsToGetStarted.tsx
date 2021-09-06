import * as React from 'react';
import { Messenger } from '@estruyf/vscode/dist/client';
import { DashboardMessage } from '../../DashboardMessage';
import { Settings } from '../../models/Settings';
import { Status } from '../../models/Status';
import { Step } from './Step';

export interface IStepsToGetStartedProps {
  settings: Settings;
}

export const StepsToGetStarted: React.FunctionComponent<IStepsToGetStartedProps> = ({settings}: React.PropsWithChildren<IStepsToGetStartedProps>) => {

  const steps = [
    { 
      name: 'Initialize project', 
      description: 'Initialize the project with a template folder and sample markdown file. The template folder can be used to define your own templates. <b>Start by clicking on this action</b>.',
      status: settings.initialized ? Status.Completed : Status.NotStarted,
      onClick: settings.initialized ? undefined : () => { Messenger.send(DashboardMessage.initializeProject); }  
    },
    {
      name: 'Register content folders (manual action)',
      description: 'Register your content folder(s). You can perform this action by right-clicking on the folder in the explorer view, and selecting <b>register folder</b>. Once a folder is set, Front Matter can be used to list all contents and allow you to create content.',
      status: settings.folders && settings.folders.length > 0 ? Status.Completed : Status.NotStarted
    },
    {
      name: 'Show the dashboard',
      description: 'Once both actions are completed, click on this action to load the dashboard.',
      status: (settings.initialized && settings.folders && settings.folders.length > 0) ? Status.Active : Status.NotStarted,
      onClick: (settings.initialized && settings.folders && settings.folders.length > 0) ? () => { Messenger.send(DashboardMessage.reload); } : undefined
    }
  ];
  
  return (
    <nav aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'pb-10' : ''} relative`}>
            <Step name={step.name} description={step.description} status={step.status} showLine={stepIdx !== steps.length - 1} onClick={step.onClick} />
          </li>
        ))}
      </ol>
    </nav>
  );
};