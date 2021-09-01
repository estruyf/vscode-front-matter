import * as React from 'react';

export interface IGroupingProps {
  crntGroup: string | null;
  switchGroup: (group: string | null) => void;
}

export const Grouping: React.FunctionComponent<IGroupingProps> = (props: React.PropsWithChildren<IGroupingProps>) => {
  return (
    <>

    </>
  );
};