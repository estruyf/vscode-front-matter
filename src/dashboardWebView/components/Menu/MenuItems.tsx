import { Menu, Transition } from '@headlessui/react';
import * as React from 'react';
import { Fragment } from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IMenuItemsProps {
  widthClass?: string;
  marginTopClass?: string;
  updatePopper?: () => void;
  disablePopper?: boolean;
}

export const MenuItems: React.FunctionComponent<IMenuItemsProps> = ({
  widthClass,
  marginTopClass,
  children,
  updatePopper,
  disablePopper
}: React.PropsWithChildren<IMenuItemsProps>) => {
  const { getColors } = useThemeColors();

  return (
    <Transition
      as={Fragment}
      beforeEnter={() => (updatePopper ? updatePopper() : null)}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className={`${widthClass || ''} ${marginTopClass || 'mt-2'} ${disablePopper ? 'origin-top-right absolute right-0 z-20' : ''
          } rounded shadow-2xl ring-1 ring-opacity-5 focus:outline-none text-sm max-h-96 overflow-auto ${getColors(
            'bg-white dark:bg-vulcan-500 ring-vulcan-400 dark:ring-white',
            'bg-[var(--vscode-sideBar-background)] ring-[var(--frontmatter-border)]'
          )
          }`}
      >
        <div className="py-1">{children}</div>
      </Menu.Items>
    </Transition>
  );
};
