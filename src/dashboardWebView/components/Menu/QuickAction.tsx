import * as React from 'react';

export interface IQuickActionProps {
  title: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const QuickAction: React.FunctionComponent<IQuickActionProps> = ({
  title,
  onClick,
  children
}: React.PropsWithChildren<IQuickActionProps>) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`px-2 group inline-flex justify-center text-sm font-medium text-[var(--vscode-foreground)] hover:text-[var(--frontmatter-button-hoverBackground)]`}
    >
      {children}
      <span className="sr-only">{title}</span>
    </button>
  );
};
