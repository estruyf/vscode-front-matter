import * as React from 'react';

export interface IButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export const Button: React.FunctionComponent<IButtonProps> = ({onClick, disabled, children}: React.PropsWithChildren<IButtonProps>) => {
  return (
    <button
      type="button"
      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium text-white dark:text-vulcan-500 bg-teal-600 hover:bg-teal-700 focus:outline-none disabled:bg-gray-500"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};