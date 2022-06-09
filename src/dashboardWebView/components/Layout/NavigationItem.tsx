import * as React from 'react';

export interface INavigationItemProps {
  isSelected?: boolean;
  onClick?: () => void;
}

export const NavigationItem: React.FunctionComponent<INavigationItemProps> = ({isSelected, onClick, children}: React.PropsWithChildren<INavigationItemProps>) => {
  return (
    <button
      type='button'
      className={`px-4 py-2 flex items-center text-sm font-medium w-full text-left hover:bg-gray-200 dark:hover:bg-vulcan-400 hover:text-vulcan-500 dark:hover:text-whisper-500 cursor-pointer ${isSelected ? 'bg-gray-300 dark:bg-vulcan-300 text-vulcan-500 dark:text-whisper-500' : 'text-gray-500 dark:text-whisper-900'}`}
      onClick={onClick}>
      {children}
    </button>
  );
};