import * as React from 'react';

export interface INavigationBarProps {
  title?: string;
  bottom?: JSX.Element;
}

export const NavigationBar: React.FunctionComponent<INavigationBarProps> = ({
  title,
  bottom,
  children
}: React.PropsWithChildren<INavigationBarProps>) => {
  return (
    <aside
      className={`w-2/12 px-4 py-6 h-full flex flex-col flex-grow border-r border-[var(--frontmatter-border)]`}
    >
      {title && <h2 className={`text-lg text-[var(--vscode-tab-inactiveForeground)]`}>{title}</h2>}

      <nav className={`flex-1 py-4 -mx-4 h-full`}>
        <div
          className={`divide-y border-t border-b divide-[var(--frontmatter-border)] border-[var(--frontmatter-border)]`}
        >
          {children}
        </div>
      </nav>

      {bottom && bottom}
    </aside>
  );
};
