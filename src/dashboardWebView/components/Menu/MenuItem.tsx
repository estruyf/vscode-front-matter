import { Menu } from '@headlessui/react';
import * as React from 'react';

export interface IMenuItemProps {
  title: string;
  value?: any;
  isCurrent?: boolean;
  disabled?: boolean;
  onClick: (value: any) => void;
}

export const MenuItem: React.FunctionComponent<IMenuItemProps> = ({title, value, isCurrent, disabled, onClick}: React.PropsWithChildren<IMenuItemProps>) => {
  return (
    <Menu.Item>
      <button
        disabled={disabled}
        onClick={() => onClick(value)}
        className={`${!isCurrent ? `text-vulcan-500 dark:text-whisper-500` : `text-gray-500 dark:text-whisper-900`} block px-4 py-2 text-sm font-medium w-full text-left hover:bg-gray-100 hover:text-gray-700 dark:hover:text-whisper-600 dark:hover:bg-vulcan-100 disabled:bg-gray-500`}
      >
        {title}
      </button>
    </Menu.Item>
  );
};