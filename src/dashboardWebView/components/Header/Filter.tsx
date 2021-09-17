import { Menu } from '@headlessui/react';
import { FilterIcon } from '@heroicons/react/solid';
import * as React from 'react';
import { MenuButton, MenuItem, MenuItems } from '../Menu';

export interface IFilterProps {
  label: string;
  items: string[];
  activeItem: string | null;
  onClick: (item: string | null) => void;
}

const DEFAULT_VALUE = "No filter";

export const Filter: React.FunctionComponent<IFilterProps> = ({label, activeItem, items, onClick}: React.PropsWithChildren<IFilterProps>) => {

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <MenuButton 
          label={(
            <>
              <FilterIcon className={`inline-block w-5 h-5 mr-1`} /><span>{label}</span>
            </>
          )} 
          title={activeItem || DEFAULT_VALUE} />

        <MenuItems>
          <MenuItem 
              title={DEFAULT_VALUE}
              value={null}
              isCurrent={!!activeItem}
              onClick={() => onClick(null)} />

          {items.map((option) => (
            <MenuItem 
              key={option}
              title={option}
              value={option}
              isCurrent={option === activeItem}
              onClick={() => onClick(option)} />
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};