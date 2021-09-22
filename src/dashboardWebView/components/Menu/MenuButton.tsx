import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
import * as React from 'react';

export interface IMenuButtonProps {
  label: string | JSX.Element;
  title: string;
  disabled?: boolean;
}

export const MenuButton: React.FunctionComponent<IMenuButtonProps> = ({label, title, disabled}: React.PropsWithChildren<IMenuButtonProps>) => {
  return (
    <div className={`inline-flex items-center ${disabled ? 'opacity-50' : ''}`}>
      <span className={`text-gray-500 dark:text-whisper-700 mr-2 font-medium`}>{label}:</span>
      
      <Menu.Button disabled={disabled} className="group inline-flex justify-center text-sm font-medium text-vulcan-500 hover:text-vulcan-600 dark:text-whisper-500 dark:hover:text-whisper-600">
        {title}
        <ChevronDownIcon
          className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-whisper-600 dark:group-hover:text-whisper-700"
          aria-hidden="true"
        />
      </Menu.Button>
    </div>
  );
};