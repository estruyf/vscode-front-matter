import * as React from 'react';
import { SortableContainer } from 'react-sortable-hoc';
import useThemeColors from '../../hooks/useThemeColors';

export interface ISortableContainerProps { }

export const Container = SortableContainer(
  ({ children }: React.PropsWithChildren<ISortableContainerProps>) => {
    const { getColors } = useThemeColors();

    return (
      <ul
        className={`-mx-4 divide-y border-t border-b ${getColors(`divide-gray-200 dark:divide-vulcan-300 border-gray-200 dark:border-vulcan-300`, `divide-[var(--frontmatter-border)] border-[var(--frontmatter-border)]`)
          }`}
      >
        {children}
      </ul>
    );
  }
);
