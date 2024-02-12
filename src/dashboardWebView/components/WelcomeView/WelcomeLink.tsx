import * as React from 'react';

export interface IWelcomeLinkProps {
  href: string;
  title: string;
}

export const WelcomeLink: React.FunctionComponent<IWelcomeLinkProps> = ({ href, title, children }: React.PropsWithChildren<IWelcomeLinkProps>) => {
  return (
    <a
      href={href}
      title={title}
      className={`flex items-center px-1 text-[var(--vscode-editor-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]`}
    >
      {children}
    </a>
  );
};