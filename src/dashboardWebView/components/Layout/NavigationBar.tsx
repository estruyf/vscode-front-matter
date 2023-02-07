import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface INavigationBarProps {
  title?: string;
  bottom?: JSX.Element;
}

export const NavigationBar: React.FunctionComponent<INavigationBarProps> = ({
  title,
  bottom,
  children
}: React.PropsWithChildren<INavigationBarProps>) => {
  const { getColors } = useThemeColors();
  
  return (
    <aside
      className={`w-2/12 px-4 py-6 h-full flex flex-col flex-grow border-r ${getColors(
        'border-gray-200 dark:border-vulcan-300',
        'border-[var(--vscode-panel-border)]'
      )}`}
    >
      {title && <h2 className={`text-lg ${
        getColors(
          'text-gray-500 dark:text-whisper-900',
          'text-[var(--vscode-tab-inactiveForeground)]'
        )
      }`}>{title}</h2>}

      <nav className={`flex-1 py-4 -mx-4 h-full`}>
        <div
          className={`divide-y border-t border-b  ${
            getColors(
              'divide-gray-200 dark:divide-vulcan-300 border-gray-200 dark:border-vulcan-300',
              'divide-[var(--vscode-panel-border)] border-[var(--vscode-panel-border)]'
            )
          }`}
        >
          <div>{children}</div>
        </div>
      </nav>

      {bottom && bottom}
    </aside>
  );
};
