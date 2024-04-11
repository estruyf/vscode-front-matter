import { ChevronDownIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';

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
  return (
    <div className={`group flex items-center shrink-0 ${disabled ? 'opacity-50' : ''}`}>
      <div className={`mr-2 font-medium flex items-center text-[var(--vscode-tab-inactiveForeground)]`}>
        {label}:
      </div>

      <DropdownMenuTrigger
        className='text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] flex items-center focus:outline-none'
        disabled={disabled}>
        <span>{title}</span>
        <ChevronDownIcon className={`-mr-1 ml-1 h-4 w-4`} aria-hidden="true" />
      </DropdownMenuTrigger>
    </div>
  );
};
