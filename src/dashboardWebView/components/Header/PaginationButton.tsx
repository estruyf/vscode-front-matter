import * as React from 'react';

export interface IPaginationButtonProps {
  title: string;
  disabled?: boolean;
  onClick: () => void;
}

export const PaginationButton: React.FunctionComponent<IPaginationButtonProps> = ({title, disabled, onClick}: React.PropsWithChildren<IPaginationButtonProps>) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500 disabled:hover:text-gray-500 dark:disabled:hover:text-whisper-900 disabled:opacity-50`}
    >
      {title}
    </button>
  );
};