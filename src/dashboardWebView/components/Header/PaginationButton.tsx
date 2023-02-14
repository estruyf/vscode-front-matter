import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IPaginationButtonProps {
  title: string;
  disabled?: boolean;
  onClick: () => void;
}

export const PaginationButton: React.FunctionComponent<IPaginationButtonProps> = ({
  title,
  disabled,
  onClick
}: React.PropsWithChildren<IPaginationButtonProps>) => {
  const { getColors } = useThemeColors();

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`disabled:opacity-50 ${
        getColors(
          'text-gray-500 hover:text-gray-600 dark:text-whisper-900 dark:hover:text-whisper-500 disabled:hover:text-gray-500 dark:disabled:hover:text-whisper-900',
          'text-[var(--vscode-editor-foreground)] hover:text-[var(--vscode-list-activeSelectionForeground)]'
        )
      }`}
    >
      {title}
    </button>
  );
};
