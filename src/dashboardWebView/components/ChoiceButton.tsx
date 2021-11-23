import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/outline';
import * as React from 'react';
import { MenuItem, MenuItems } from './Menu';

export interface IChoiceButtonProps {
  title: string;
  choices: { 
    title: string;
    disabled?: boolean;
    onClick: () => void;
  }[];
  disabled?: boolean;
  onClick: () => void;
}

export const ChoiceButton: React.FunctionComponent<IChoiceButtonProps> = ({onClick, disabled, choices, title}: React.PropsWithChildren<IChoiceButtonProps>) => {
  return (
    <span className="relative z-50 inline-flex shadow-sm rounded-md">
      <button
        type="button"
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:bg-gray-500"
        onClick={onClick}
        disabled={disabled}
      >
        {title}
      </button>

      <Menu as="span" className="-ml-px relative block">
        <Menu.Button 
          className="h-full inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium text-white dark:text-vulcan-500 bg-teal-700 hover:bg-teal-800 focus:outline-none disabled:bg-gray-500"
          disabled={disabled}>
          <span className="sr-only">Open options</span>
          <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
        </Menu.Button>

        <MenuItems widthClass={`w-56`}>
          <div className="py-1">
            {choices.map((choice) => (
              <MenuItem 
                key={choice.title}
                title={choice.title} 
                value={null}
                onClick={choice.onClick}
                disabled={choice.disabled} />
            ))}
          </div>
        </MenuItems>
      </Menu>
    </span>
  );
};