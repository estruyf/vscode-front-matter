import { Menu, Transition } from '@headlessui/react';
import * as React from 'react';
import { Fragment } from 'react';

export interface IMenuItemsProps {
  widthClass?: string;
}

export const MenuItems: React.FunctionComponent<IMenuItemsProps> = ({widthClass, children}: React.PropsWithChildren<IMenuItemsProps>) => {
  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items className={`${widthClass || "w-40"} origin-top-right absolute right-0 z-10 mt-2 rounded-md shadow-2xl bg-white dark:bg-vulcan-500 ring-1 ring-vulcan-400 dark:ring-white ring-opacity-5 focus:outline-none text-sm max-h-96 overflow-auto`}>
        <div className="py-1">
          {children}
        </div>
      </Menu.Items>
    </Transition>
  );
};