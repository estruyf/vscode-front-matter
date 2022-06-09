import * as React from 'react';

export interface INavigationBarProps {
  title?: string;
  bottom?: JSX.Element;
}

export const NavigationBar: React.FunctionComponent<INavigationBarProps> = ({title, bottom, children}: React.PropsWithChildren<INavigationBarProps>) => {
  return (
    <aside className={`w-2/12 px-4 py-6 h-full flex flex-col flex-grow border-r border-gray-200 dark:border-vulcan-300`}>
      {
        title && <h2 className={`text-lg text-gray-500 dark:text-whisper-900`}>{title}</h2>
      }

      <nav className={`flex-1 py-4 -mx-4 h-full`}>
        <div className={`divide-y divide-gray-200 dark:divide-vulcan-300 border-t border-b border-gray-200 dark:border-vulcan-300`}>
          <div>
            {children}
          </div>
        </div>
      </nav>

      {
        bottom && bottom
      }
    </aside>
  );
};