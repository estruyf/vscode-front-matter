import * as React from 'react';
import { CheckCircleIcon, PlusCircleIcon } from '@heroicons/react/outline';
import { CheckCircleIcon as CheckCircleIconSolid, PlusCircleIcon as PlusCircleIconSolid } from '@heroicons/react/solid';

export interface ISelectItemProps {
  title: string;
  icon?: "add" | "select";
  buttonTitle: string;
  isSelected: boolean;
  onClick: () => void;
}

export const SelectItem: React.FunctionComponent<ISelectItemProps> = ({
  title,
  icon = "select",
  buttonTitle,
  isSelected,
  onClick
}: React.PropsWithChildren<ISelectItemProps>) => {
  return (
    <div
      className={`text-sm flex items-center ${isSelected ? 'text-[var(--vscode-textLink-foreground)]' : ''}`}
    >
      <button
        onClick={onClick}
        className={`mr-2 flex gap-2 items-center hover:text-[var(--vscode-textLink-activeForeground)]`}
        title={buttonTitle}
      >
        {isSelected ? (
          icon === "add" ? (
            <PlusCircleIconSolid className={`h-4 w-4`} />
          ) : (
            <CheckCircleIconSolid className={`h-4 w-4`} />
          )
        ) : (
          icon === "add" ? (
            <PlusCircleIcon className={`h-4 w-4`} />
          ) : (
            <CheckCircleIcon className={`h-4 w-4`} />
          )
        )}
        <span>{title}</span>
      </button>
    </div>
  );
};