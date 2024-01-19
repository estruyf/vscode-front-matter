import * as React from 'react';

export interface ILinkProps {
  title: string;
  href: string;
  className?: string;
}

export const Link: React.FunctionComponent<ILinkProps> = ({ children, title, href, className }: React.PropsWithChildren<ILinkProps>) => {
  return (
    <a
      className={`text-[var(--frontmatter-secondary-text)] hover:text-[var(--frontmatter-link-hover)] ${className || ""}`}
      title={title}
      href={href}>
      {children}
    </a>
  );
};