import { Menu } from '@headlessui/react';
import * as React from 'react';
import { useRecoilState } from 'recoil';
import { FolderAtom } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface IFoldersProps {
  folders: string[];
}

const DEFAULT_TYPE = "All types";

export const Folders: React.FunctionComponent<IFoldersProps> = ({folders}: React.PropsWithChildren<IFoldersProps>) => {
  const [ crntFolder, setCrntFolder ] = useRecoilState(FolderAtom);

  if (folders.length <= 1) {
    return null;
  }
  
  return (
    <div className="flex items-center">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton label={`Showing`} title={crntFolder || DEFAULT_TYPE} />

        <MenuItems>
          <MenuItem 
            title={DEFAULT_TYPE}
            value={null}
            isCurrent={!crntFolder}
            onClick={(value) => setCrntFolder(value)} />

          {folders.map((option) => (
            <MenuItem 
              key={option}
              title={option}
              value={option}
              isCurrent={option === crntFolder}
              onClick={(value) => setCrntFolder(value)} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};