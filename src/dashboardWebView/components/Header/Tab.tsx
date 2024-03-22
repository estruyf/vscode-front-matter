import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { NavigationType } from '../../models';
import { cn } from '../../../utils/cn';

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
      className={cn(`h-full flex items-center py-2 px-1 text-sm font-medium text-center border-b-2 border-transparent hover:border-[var(--vscode-tab-activeForeground)] hover:text-[var(--vscode-tab-activeForeground)] ${location.pathname === `/${navigationType}`
        ?
        `text-[var(--vscode-tab-activeForeground)] border-[var(--vscode-tab-activeForeground)]` :
        `text-[var(--vscode-tab-inactiveForeground)]`
        }`)}
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
