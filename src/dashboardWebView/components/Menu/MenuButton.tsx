import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IMenuButtonProps {
  label: string | JSX.Element;
  title: string;
  disabled?: boolean;
}

export const MenuButton: React.FunctionComponent<IMenuButtonProps> = ({
  label,
  title,
  disabled
}: React.PropsWithChildren<IMenuButtonProps>) => {
  const { getColors } = useThemeColors();

  return (
    <div className={`group flex items-center ${disabled ? 'opacity-50' : ''}`}>
      <div className={`mr-2 font-medium flex items-center ${getColors('text-gray-500 dark:text-whisper-700', 'text-[var(--vscode-tab-inactiveForeground)]')}`}>{label}:</div>

      <Menu.Button
        disabled={disabled}
        className={`group inline-flex justify-center text-sm font-medium text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]`}
      >
        {title}
        <ChevronDownIcon
          className={`flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-[var(--vscode-textLink-foreground)] group-hover:text-[var(--vscode-textLink-activeForeground)]`}
          aria-hidden="true"
        />
      </Menu.Button>
    </div>
  );
};
