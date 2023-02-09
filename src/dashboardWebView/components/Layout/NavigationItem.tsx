import * as React from 'react';
import useThemeColors from '../../hooks/useThemeColors';

export interface INavigationItemProps {
  isSelected?: boolean;
  onClick?: () => void;
}

export const NavigationItem: React.FunctionComponent<INavigationItemProps> = ({
  isSelected,
  onClick,
  children
}: React.PropsWithChildren<INavigationItemProps>) => {
  const { getColors } = useThemeColors();

  return (
    <button
      type="button"
      className={`navigationitem px-4 py-2 flex items-center text-sm font-medium w-full text-left cursor-pointer ${getColors(
        'hover:bg-gray-200 dark:hover:bg-vulcan-400 hover:text-vulcan-500 dark:hover:text-whisper-500',
        'hover:bg-[var(--frontmatter-list-hover-background)] hover:text-[var(--frontmatter-list-selected-text)]'
      )
        } ${isSelected
          ? getColors(
            'bg-gray-300 dark:bg-vulcan-300 text-vulcan-500 dark:text-whisper-500',
            'bg-[var(--frontmatter-list-selected-background)] text-[var(--frontmatter-list-selected-text)]'
          ) : getColors(
            'text-gray-500 dark:text-whisper-900',
            'text-[var(--frontmatter-list-text)]'
          )
        }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
