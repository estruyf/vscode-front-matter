import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import * as React from 'react';
import { Fragment } from 'react';
import { MenuButton } from './MenuButton';
import { MenuItem } from './MenuItem';
import { MenuItems } from './MenuItems';

export interface IGroupingProps {
  groups: string[];
  crntGroup: string | null;
  switchGroup: (group: string | null) => void;
}

const DEFAULT_TYPE = "All types";

export const Grouping: React.FunctionComponent<IGroupingProps> = ({groups, crntGroup, switchGroup}: React.PropsWithChildren<IGroupingProps>) => {
  if (groups.length <= 1) {
    return null;
  }
  
  return (
    <div className="flex items-center ml-6">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton label={`Showing`} title={crntGroup || DEFAULT_TYPE} />

        <MenuItems>
          <MenuItem 
            title={DEFAULT_TYPE}
            value={null}
            isCurrent={!crntGroup}
            onClick={switchGroup} />

          {groups.map((option) => (
            <MenuItem 
              key={option}
              title={option}
              value={option}
              isCurrent={option === crntGroup}
              onClick={switchGroup} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};