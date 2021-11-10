import { Menu } from '@headlessui/react';
import * as React from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { FolderAtom, SettingsSelector } from '../../state';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface IFoldersProps {}

const DEFAULT_TYPE = "All types";

export const Folders: React.FunctionComponent<IFoldersProps> = ({}: React.PropsWithChildren<IFoldersProps>) => {
  const [ crntFolder, setCrntFolder ] = useRecoilState(FolderAtom);
  const settings = useRecoilValue(SettingsSelector);
  const contentFolders = settings?.contentFolders || [];

  if (contentFolders.length <= 1) {
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

          {contentFolders.map((option) => (
            <MenuItem 
              key={option.title}
              title={option.title}
              value={option.title}
              isCurrent={option.title === crntFolder}
              onClick={(value) => setCrntFolder(value)} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};