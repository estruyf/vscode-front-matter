import { Menu } from '@headlessui/react';
import * as React from 'react';
import { GroupOption } from '../../constants/GroupOption';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface IGroupingProps {
  group: GroupOption;
  switchGroup: (group: GroupOption) => void;
}

export const groupOptions = [
  { name: "None", id: GroupOption.none },
  { name: "Year", id: GroupOption.Year },
  { name: "Draft/Published", id: GroupOption.Draft },
];

export const Grouping: React.FunctionComponent<IGroupingProps> = ({group, switchGroup}: React.PropsWithChildren<IGroupingProps>) => {
  const crntGroup = groupOptions.find(x => x.id === group);

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton label={`Group by`} title={crntGroup?.name || ""} />

        <MenuItems>
          {groupOptions.map((option) => (
            <MenuItem 
              key={option.id}
              title={option.name}
              value={option.id}
              isCurrent={option.id === crntGroup?.id}
              onClick={switchGroup} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};