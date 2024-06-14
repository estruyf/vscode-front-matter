import * as React from 'react';
import { cn } from '../../../utils/cn';

export interface IQuickActionProps {
  title: string;
  className?: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const QuickAction: React.FunctionComponent<IQuickActionProps> = ({
  title,
  className,
  onClick,
  children
}: React.PropsWithChildren<IQuickActionProps>) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(`px-2 group inline-flex justify-center text-sm font-medium text-[var(--frontmatter-text)] hover:text-[var(--frontmatter-button-hoverBackground)]`, className)}
    >
      {children}
      <span className="sr-only">{title}</span>
    </button>
  );
};
