import * as React from 'react';

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
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`disabled:opacity-50 text-[var(--vscode-editor-foreground)] hover:text-[var(--vscode-list-activeSelectionForeground)]`}
    >
      {title}
    </button>
  );
};
