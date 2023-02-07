import * as React from 'react';
import { useLocation } from 'react-router-dom';
import useThemeColors from '../../hooks/useThemeColors';
import { NavigationType } from '../../models';

export interface ITabProps {
  navigationType: NavigationType;
  onNavigate: (navigationType: NavigationType) => void;
}

export const Tab: React.FunctionComponent<ITabProps> = ({
  navigationType,
  onNavigate,
  children
}: React.PropsWithChildren<ITabProps>) => {
  const location = useLocation();
  const { getColors } = useThemeColors();

  return (
    <button
      className={`h-full flex items-center py-2 px-4 text-sm font-medium text-center border-b-2 border-transparent ${
        getColors(
          'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300',
          'text-[var(--vscode-tab-inactiveForeground)] hover:border-[var(--vscode-list-activeSelectionForeground)] hover:text-[var(--vscode-list-activeSelectionForeground)]'
        )
      } ${
        location.pathname === `/${navigationType}`
          ? getColors(
              'text-vulcan-500 dark:text-whisper-500 border-vulcan-500 dark:border-whisper-500',
              'text-[var(--vscode-tab-activeForeground)] border-[var(--vscode-tab-activeForeground)]'
            ) : getColors(
              'text-gray-500 dark:text-gray-400',
              'text-[var(--vscode-tab-inactiveForeground)]'
            )
      }`}
      type="button"
      role="tab"
      aria-controls="profile"
      aria-selected="false"
      onClick={() => onNavigate(navigationType)}
    >
      {children}
    </button>
  );
};
