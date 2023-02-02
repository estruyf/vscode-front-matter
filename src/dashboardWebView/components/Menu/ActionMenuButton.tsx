import { Menu } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/outline';
import * as React from 'react';

export interface IActionMenuButtonProps {
  title: string;
  disabled?: boolean;
  ref?: (instance: Element | null) => void;
}

export const ActionMenuButton: React.FunctionComponent<IActionMenuButtonProps> = ({
  title,
  disabled,
  ref
}: React.PropsWithChildren<IActionMenuButtonProps>) => {
  return (
    <Menu.Button
      ref={ref || null}
      disabled={disabled}
      className={`group inline-flex justify-center text-sm font-medium text-vulcan-400 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <span className="sr-only">{title}</span>
      <DotsVerticalIcon className="w-4 h-4" aria-hidden="true" />
    </Menu.Button>
  );
};
