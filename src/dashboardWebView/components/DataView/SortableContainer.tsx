import * as React from 'react';
import { SortableContainer } from 'react-sortable-hoc';

export interface ISortableContainerProps { }

export const Container = SortableContainer(
  ({ children }: React.PropsWithChildren<ISortableContainerProps>) => {

    return (
      <ul
        className={`-mx-4 divide-y border-t border-b divide-[var(--frontmatter-border)] border-[var(--frontmatter-border)]`}
      >
        {children}
      </ul>
    );
  }
);
