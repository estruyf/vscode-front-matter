import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface IWelcomeLinkProps {
  href: string;
  title: string;
}

export const WelcomeLink: React.FunctionComponent<IWelcomeLinkProps> = ({ href, title, children }: React.PropsWithChildren<IWelcomeLinkProps>) => {
  const { getColors } = useThemeColors();

  return (
    <a
      href={href}
      title={title}
      className={`flex items-center px-1 ${getColors(
        'text-vulcan-300 hover:text-vulcan-500 dark:text-whisper-500 dark:hover:text-teal-500',
        'text-[var(--vscode-editor-foreground)] hover:text-[var(--vscode-textLink-activeForeground)]'
      )
        }`}
    >
      {children}
    </a>
  );
};