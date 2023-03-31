import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';
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
    <div className={`group inline-flex items-center ${disabled ? 'opacity-50' : ''}`}>
      <div className={`mr-2 font-medium flex items-center ${getColors('text-gray-500 dark:text-whisper-700', 'text-[var(--vscode-tab-inactiveForeground)]')}`}>{label}:</div>

      <Menu.Button
        disabled={disabled}
        className={`group inline-flex justify-center text-sm font-medium ${getColors(
          'text-vulcan-500 hover:text-vulcan-600 dark:text-whisper-500 dark:hover:text-whisper-600',
          'text-[var(--vscode-list-activeSelectionForeground)] hover:text-[var(--vscode-list-highlightForeground)]'
        )
          }`}
      >
        {title}
        <ChevronDownIcon
          className={`flex-shrink-0 -mr-1 ml-1 h-5 w-5 ${getColors(
            'text-gray-400 group-hover:text-gray-500 dark:text-whisper-600 dark:group-hover:text-whisper-700',
            'text-[var(--vscode-list-activeSelectionForeground)] group-hover:text-[var(--vscode-list-highlightForeground)]'
          )
            }`}
          aria-hidden="true"
        />
      </Menu.Button>
    </div>
  );
};
