import * as React from 'react';
import { CheckCircleIcon } from '@heroicons/react/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/solid';

export interface ISelectItemProps {
  title: string;
  buttonTitle: string;
  isSelected: boolean;
  onClick: () => void;
}

export const SelectItem: React.FunctionComponent<ISelectItemProps> = ({
  title,
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
          <CheckCircleIconSolid className={`h-4 w-4`} />
        ) : (
          <CheckCircleIcon className={`h-4 w-4`} />
        )}
        <span>{title}</span>
      </button>
    </div>
  );
};