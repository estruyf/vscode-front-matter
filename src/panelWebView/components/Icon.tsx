import * as React from 'react';

export interface IIconProps {
  name: string;
}

const Icon: React.FunctionComponent<IIconProps> = ({ name }: React.PropsWithChildren<IIconProps>) => {
  
  return (<i className={`codicon codicon-${name}`}></i>);
};

Icon.displayName = 'Icon';
export { Icon };