import { Menu, Transition } from '@headlessui/react';
import * as React from 'react';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface IFoldersProps {
  folders: string[];
  crntFolder: string | null;
  switchFolder: (group: string | null) => void;
}

const DEFAULT_TYPE = "All types";

export const Folders: React.FunctionComponent<IFoldersProps> = ({folders, crntFolder, switchFolder}: React.PropsWithChildren<IFoldersProps>) => {
  if (folders.length <= 1) {
    return null;
  }
  
  return (
    <div className="flex items-center ml-6">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton label={`Showing`} title={crntFolder || DEFAULT_TYPE} />

        <MenuItems>
          <MenuItem 
            title={DEFAULT_TYPE}
            value={null}
            isCurrent={!crntFolder}
            onClick={switchFolder} />

          {folders.map((option) => (
            <MenuItem 
              key={option}
              title={option}
              value={option}
              isCurrent={option === crntFolder}
              onClick={switchFolder} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};