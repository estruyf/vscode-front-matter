import * as React from 'react';

export interface ILinkButtonProps {
  title: string;
  onClick: () => void;
}

export const LinkButton: React.FunctionComponent<ILinkButtonProps> = ({ children, title, onClick }: React.PropsWithChildren<ILinkButtonProps>) => {
  return (
    <button
      type="button"
      className={`text-[var(--frontmatter-secondary-text)] hover:text-[var(--frontmatter-link-hover)]`}
      title={title}
      onClick={onClick}>
      {children}
    </button >
  );
};