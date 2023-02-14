import { Menu } from '@headlessui/react';
import { DotsVerticalIcon } from '@heroicons/react/outline';
import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

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
  const { getColors } = useThemeColors();

  return (
    <Menu.Button
      ref={ref || null}
      disabled={disabled}
      className={`group inline-flex justify-center text-sm font-medium ${
        getColors(
          'text-vulcan-400 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600',
          'text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)]'
        )
      } ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <span className="sr-only">{title}</span>
      <DotsVerticalIcon className="w-4 h-4" aria-hidden="true" />
    </Menu.Button>
  );
};
