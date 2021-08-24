import { Menu, Transition } from '@headlessui/react';
import * as React from 'react';
import { Tab } from '../constants/Tab';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Fragment } from 'react';
import { SortOption } from '../constants/SortOption';

export interface IHeaderProps {
  currentTab: Tab;
  currentSorting: SortOption;

  switchTab: (tabId: Tab) => void;
  switchSorting: (sortId: SortOption) => void;
}

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

export const tabs = [
  { name: 'All articles', id: Tab.All},
  { name: 'Published', id: Tab.Published },
  { name: 'In draft', id: Tab.Draft }
];

export const sortOptions = [
  { name: "Last modified", id: SortOption.LastModified },
  { name: "By filename (asc)", id: SortOption.FileNameAsc },
  { name: "By filename (desc)", id: SortOption.FileNameDesc },
];

export const Header: React.FunctionComponent<IHeaderProps> = ({currentTab, currentSorting, switchSorting, switchTab}: React.PropsWithChildren<IHeaderProps>) => {

  return (
    <div className="px-4 flex items-center border-b border-gray-200 mb-8 sticky top-0 z-50 bg-gray-50 shadow-sm">
      <nav className="flex-1 -mb-px flex space-x-6 xl:space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            className={classNames(
              tab.id === currentTab
                ? 'border-teal-900 text-teal-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            )}
            aria-current={tab.id === currentTab ? 'page' : undefined}
            onClick={() => switchTab(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      <div className="flex items-center ml-6">
        <Menu as="div" className="relative z-10 inline-block text-left">
          <div>
            <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-500 hover:text-gray-700">
              Sort
              <ChevronDownIcon
                className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
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
            <Menu.Items className="origin-top-right absolute right-0 z-10 mt-2 w-40 rounded-md shadow-2xl bg-white ring-1 ring-vulcan-400 ring-opacity-5 focus:outline-none text-sm">
              <div className="py-1">
                {sortOptions.map((option) => (
                  <Menu.Item key={option.id}>
                    <button
                      onClick={() => switchSorting(option.id)}
                      className={classNames(
                        option.id === currentSorting ? 'text-vulcan-500' : 'text-gray-500',
                        'block px-4 py-2 text-sm font-medium w-full text-left hover:text-gray-700'
                      )}
                    >
                      {option.name}
                    </button>
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};