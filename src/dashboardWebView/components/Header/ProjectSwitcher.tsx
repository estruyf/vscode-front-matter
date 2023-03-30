import { messageHandler } from '@estruyf/vscode/dist/client';
import { Menu } from '@headlessui/react';
import { GlobeAltIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { DashboardMessage } from '../../DashboardMessage';
import { SettingsSelector } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface IProjectSwitcherProps { }

export const ProjectSwitcher: React.FunctionComponent<IProjectSwitcherProps> = (props: React.PropsWithChildren<IProjectSwitcherProps>) => {
  const [crntProject, setCrntProject] = React.useState<string | undefined>(undefined);
  const settings = useRecoilValue(SettingsSelector);

  const project = settings?.project;
  const projects = settings?.projects || [];

  const setProject = (value: string) => {
    setCrntProject(value);
    messageHandler.send(DashboardMessage.switchProject, value)
  }

  React.useEffect(() => {
    setCrntProject(project?.name);
  }, [project]);

  if (projects.length <= 1 || !crntProject) {
    return null;
  }

  return (
    <div className="flex items-center mr-4 z-[51]">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton
          label={(
            <div className="inline-flex items-center">
              <GlobeAltIcon className="h-4 w-4 mr-2" />
              <span>project</span>
            </div>
          )}
          title={crntProject} />

        <MenuItems disablePopper>
          {projects.map((p) => (
            <MenuItem
              key={p.name}
              title={p.name}
              value={p.name}
              isCurrent={p.name === crntProject}
              onClick={(value) => setProject(p.name)}
            />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};