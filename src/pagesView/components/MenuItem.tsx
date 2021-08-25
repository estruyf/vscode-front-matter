import { Menu } from '@headlessui/react';
import * as React from 'react';

export interface IMenuItemProps {
  title: string;
  value: any;
  isCurrent: boolean;
  onClick: (value: any) => void;
}

export const MenuItem: React.FunctionComponent<IMenuItemProps> = ({title, value, isCurrent, onClick}: React.PropsWithChildren<IMenuItemProps>) => {
  return (
    <Menu.Item>
      <button
        onClick={() => onClick(value)}
        className={`${!isCurrent ? `text-vulcan-500 dark:text-whisper-500` : `text-gray-500 dark:text-whisper-900`} block px-4 py-2 text-sm font-medium w-full text-left hover:text-gray-700 dark:hover:text-whisper-600`}
      >
        {title}
      </button>
    </Menu.Item>
  );
};