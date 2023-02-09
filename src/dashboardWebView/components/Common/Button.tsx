import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

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
  const { getColors } = useThemeColors();

  return (
    <button
      type="button"
      className={`${className || ''
        } inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium focus:outline-none ${getColors(
          'text-white dark:text-vulcan-500 disabled:bg-gray-500',
          'disabled:opacity-50'
        )
        } ${secondary ?
          getColors(`bg-red-300 hover:bg-red-400`, `bg-[var(--vscode-button-secondaryBackground)] text-[--vscode-button-secondaryForeground] hover:bg-[var(--vscode-button-secondaryHoverBackground)]`) :
          getColors(`bg-teal-600 hover:bg-teal-700`, `bg-[var(--frontmatter-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--frontmatter-button-hoverBackground)]`)
        }
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
