import * as React from 'react';

export interface IBaseViewProps {}

export const BaseView: React.FunctionComponent<IBaseViewProps> = (props: React.PropsWithChildren<IBaseViewProps>) => {
  return (
    <div className="frontmatter">
        
    </div>
  );
};