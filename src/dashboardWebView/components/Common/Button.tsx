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
      className={`${className || ''
        } inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium focus:outline-none rounded disabled:opacity-50 ${secondary ?
          `bg-[var(--vscode-button-secondaryBackground)] text-[--vscode-button-secondaryForeground] hover:bg-[var(--vscode-button-secondaryHoverBackground)]` :
          `bg-[var(--frontmatter-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--frontmatter-button-hoverBackground)]`
        }
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
