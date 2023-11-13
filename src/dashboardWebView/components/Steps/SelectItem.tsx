import * as React from 'react';
import { CheckCircleIcon, PlusCircleIcon } from '@heroicons/react/outline';
import { CheckCircleIcon as CheckCircleIconSolid, PlusCircleIcon as PlusCircleIconSolid } from '@heroicons/react/solid';

export interface ISelectItemProps {
  title: string;
  buttonTitle: string;
  isSelected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const SelectItem: React.FunctionComponent<ISelectItemProps> = ({
  title,
  buttonTitle,
  isSelected,
  disabled,
  onClick
}: React.PropsWithChildren<ISelectItemProps>) => {
  return (
    <div
      className={`text-sm flex items-center ${isSelected ? 'text-[var(--vscode-textLink-foreground)]' : ''}`}
    >
      <button
        onClick={onClick}
        className={`mr-2 flex gap-2 items-center hover:text-[var(--vscode-textLink-activeForeground)] disabled:cursor-not-allowed`}
        title={buttonTitle}
        disabled={disabled}
      >
        {isSelected ? (
          <CheckCircleIconSolid className={`h-4 w-4`} />
        ) : (
          <PlusCircleIcon className={`h-4 w-4`} />
        )}
        <span>{title}</span>
      </button>
    </div>
  );
};