import * as React from 'react';
import { useLocation } from 'react-router-dom';
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

  return (
    <button
      className={`h-full flex items-center py-2 px-4 text-sm font-medium text-center border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 ${
        location.pathname === `/${navigationType}`
          ? 'border-vulcan-500 text-vulcan-500  dark:border-whisper-500 dark:text-whisper-500'
          : 'text-gray-500 dark:text-gray-400'
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
