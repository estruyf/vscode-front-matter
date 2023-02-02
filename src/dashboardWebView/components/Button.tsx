import * as React from 'react';

export interface IButtonProps {
  secondary?: boolean;
  disabled?: boolean;
  className?: string;
  onClick: () => void;
}

export const Button: React.FunctionComponent<IButtonProps> = ({
  onClick,
  className,
  disabled,
  secondary,
  children
}: React.PropsWithChildren<IButtonProps>) => {
  return (
    <button
      type="button"
      className={`${
        className || ''
      } inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium text-white dark:text-vulcan-500 focus:outline-none disabled:bg-gray-500 ${
        secondary ? `bg-red-300 hover:bg-red-400` : `bg-teal-600 hover:bg-teal-700`
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
