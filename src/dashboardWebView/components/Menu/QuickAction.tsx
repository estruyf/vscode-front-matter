import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IQuickActionProps {
  title: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const QuickAction: React.FunctionComponent<IQuickActionProps> = ({
  title,
  onClick,
  children
}: React.PropsWithChildren<IQuickActionProps>) => {
  const { getColors } = useThemeColors();

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 group inline-flex justify-center text-sm font-medium ${
        getColors(
          'text-vulcan-400 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600',
          'text-[var(--vscode-foreground)] hover:text-[var(--vscode-list-activeSelectionForeground)]'
        )
      }`}
    >
      {children}
      <span className="sr-only">{title}</span>
    </button>
  );
};
