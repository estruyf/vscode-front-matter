import { Menu } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/outline';
import * as React from 'react';

export interface IMenuButtonProps {
    title: string;
    disabled?: boolean;
}

export const MenuButton: React.FunctionComponent<IMenuButtonProps> = ({ title, disabled }: React.PropsWithChildren<IMenuButtonProps>) => {
  return (
    <div className={`inline-flex items-center ${disabled ? 'opacity-50' : ''}`}>      
      <Menu.Button disabled={disabled} className="group inline-flex justify-center text-sm font-medium text-vulcan-400 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600">
        <span className="sr-only">{title}</span>
        <DotsVerticalIcon className="h-5 w-5" aria-hidden="true" />
      </Menu.Button>
    </div>
  );
};

