import { Menu, Transition } from '@headlessui/react';
import * as React from 'react';
import { SortOption } from '../constants/SortOption';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Fragment } from 'react';
import { MenuItem } from './MenuItem';

export interface ISortingProps {
  currentSorting: SortOption;
  
  switchSorting: (sortId: SortOption) => void;
}

export const sortOptions = [
  { name: "Last modified", id: SortOption.LastModified },
  { name: "By filename (asc)", id: SortOption.FileNameAsc },
  { name: "By filename (desc)", id: SortOption.FileNameDesc },
];

export const Sorting: React.FunctionComponent<ISortingProps> = ({currentSorting, switchSorting}: React.PropsWithChildren<ISortingProps>) => {

  const crntSort = sortOptions.find(x => x.id === currentSorting);

  return (
    <div className="flex items-center ml-6">
      <Menu as="div" className="relative z-10 inline-block text-left">
        <div>
          <span className={`text-gray-500 dark:text-whisper-700 mr-2 font-medium`}>Sort by:</span>
          <Menu.Button className="group inline-flex justify-center text-sm font-medium text-vulcan-500 hover:text-vulcan-600 dark:text-whisper-500 dark:hover:text-whisper-600">
            {crntSort?.name}
            <ChevronDownIcon
              className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-whisper-600 dark:group-hover:text-whisper-700"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="origin-top-right absolute right-0 z-10 mt-2 w-40 rounded-md shadow-2xl bg-white dark:bg-vulcan-500 ring-1 ring-vulcan-400 dark:ring-white ring-opacity-5 focus:outline-none text-sm">
            <div className="py-1">
              {sortOptions.map((option) => (
                <MenuItem 
                  key={option.id}
                  title={option.name}
                  value={option.id}
                  isCurrent={option.id === currentSorting}
                  onClick={switchSorting} />
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};