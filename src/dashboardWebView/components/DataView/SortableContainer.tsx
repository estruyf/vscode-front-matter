import * as React from 'react';
import { SortableContainer } from 'react-sortable-hoc';

export interface ISortableContainerProps {}

export const Container = SortableContainer(({ children }: React.PropsWithChildren<ISortableContainerProps>) => ( <ul className={`-mx-4 divide-y divide-gray-200 dark:divide-vulcan-300 border-t border-b border-gray-200 dark:border-vulcan-300`}>{children}</ul> ));