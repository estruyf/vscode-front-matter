import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import * as React from 'react';

export interface IActionMenuButtonProps {
  title: string;
  disabled?: boolean;
  ref?: (instance: Element | null) => void;
}

export const ActionMenuButton: React.FunctionComponent<IActionMenuButtonProps> = ({
  title,
  disabled,
  ref
}: React.PropsWithChildren<IActionMenuButtonProps>) => {
  return (
    <button
      ref={ref || null}
      onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
      disabled={disabled}
      className={`group inline-flex justify-center text-sm font-medium text-[var(--vscode-tab-inactiveForeground)] hover:text-[var(--vscode-tab-activeForeground)] ${disabled ? 'opacity-50' : ''}`}
    >
      <span className="sr-only">{title}</span>
      <EllipsisVerticalIcon className="w-4 h-4" aria-hidden="true" />
    </button>
  );
};
