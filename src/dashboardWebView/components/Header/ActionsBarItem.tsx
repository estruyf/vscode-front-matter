import * as React from 'react';
import { cn } from '../../../utils/cn';

export interface IActionsBarItemProps {
  title?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const ActionsBarItem: React.FunctionComponent<IActionsBarItemProps> = ({
  children,
  className,
  disabled,
  onClick,
  title
}: React.PropsWithChildren<IActionsBarItemProps>) => {
  return (
    <button
      type="button"
      title={title || ''}
      className={cn(`flex items-center text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] disabled:opacity-50 disabled:hover:text-[var(--vscode-tab-inactiveForeground)]`, className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};