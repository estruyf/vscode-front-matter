import * as React from 'react';

export interface IListProps {}

export const List: React.FunctionComponent<IListProps> = ({children}: React.PropsWithChildren<IListProps>) => {
  return (
    <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
      {children}
    </ul>
  );
};