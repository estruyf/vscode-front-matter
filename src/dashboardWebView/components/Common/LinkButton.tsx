import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface ILinkButtonProps {
  title: string;
  onClick: () => void;
}

export const LinkButton: React.FunctionComponent<ILinkButtonProps> = ({ children, title, onClick }: React.PropsWithChildren<ILinkButtonProps>) => {
  const { getColors } = useThemeColors();

  return (
    <button
      type="button"
      className={
        getColors(
          `text-gray-500 hover:text-vulcan-600 dark:text-gray-400 dark:hover:text-whisper-600`,
          `text-[var(--frontmatter-secondary-text)] hover:text-[var(--frontmatter-link-hover)]`
        )
      }
      title={title}
      onClick={onClick}>
      {children}
    </button >
  );
};