import { ChevronDownIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { cn } from '../../../utils/cn';

export interface IMenuButtonProps {
  label: string | JSX.Element;
  title: string;
  disabled?: boolean;
  className?: string;
  labelClass?: string;
  buttonClass?: string;
}

export const MenuButton: React.FunctionComponent<IMenuButtonProps> = ({
  label,
  title,
  disabled,
  className,
  labelClass,
  buttonClass,
}: React.PropsWithChildren<IMenuButtonProps>) => {
  return (
    <div className={cn(`group flex items-center shrink-0 ${disabled ? 'opacity-50' : ''} ${className || ""}`)}>
      <div className={cn(`mr-2 font-medium flex items-center text-[var(--vscode-tab-inactiveForeground)] ${labelClass || ""}`)}>
        {label}:
      </div>

      <DropdownMenuTrigger
        className={cn(`text-[var(--vscode-textLink-foreground)] hover:text-[var(--vscode-textLink-activeForeground)] flex items-center focus:outline-none ${buttonClass || ""}`)}
        disabled={disabled}>
        <span>{title}</span>
        <ChevronDownIcon className={`-mr-1 ml-1 h-4 w-4`} aria-hidden="true" />
      </DropdownMenuTrigger>
    </div>
  );
};
