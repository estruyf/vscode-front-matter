import * as React from 'react';

export interface IListProps {
  gap?: number;
}

export const List: React.FunctionComponent<IListProps> = ({
  gap,
  children
}: React.PropsWithChildren<IListProps>) => {
  const gapClass = gap !== undefined ? `gap-y-${gap}` : `gap-y-8`;

  return (
    <ul
      role="list"
      className={`grid grid-cols-2 gap-x-4 ${gapClass} sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8`}
    >
      {children}
    </ul>
  );
};
