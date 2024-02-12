import * as React from 'react';

export interface IListProps {
  gap?: number;
}

export const List: React.FunctionComponent<IListProps> = ({
  gap,
  children
}: React.PropsWithChildren<IListProps>) => {
  const gapClass = gap !== undefined ? `gap-y-${gap}` : ``;

  return (
    <ul
      role="list"
      className={`grid gap-4 ${gapClass} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5`}
    >
      {children}
    </ul>
  );
};
