import * as React from 'react';

export interface INavigationItemProps {
  isSelected?: boolean;
  onClick?: () => void;
}

export const NavigationItem: React.FunctionComponent<INavigationItemProps> = ({
  isSelected,
  onClick,
  children
}: React.PropsWithChildren<INavigationItemProps>) => {
  return (
    <button
      type="button"
      className={`navigationitem px-4 py-2 flex items-center text-sm font-medium w-full text-left cursor-pointer hover:bg-[var(--frontmatter-list-hover-background)] hover:text-[var(--frontmatter-list-selected-text)] ${isSelected
        ? `bg-[var(--frontmatter-list-selected-background)] text-[var(--frontmatter-list-selected-text)]` : `text-[var(--frontmatter-list-text)]`
        }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
