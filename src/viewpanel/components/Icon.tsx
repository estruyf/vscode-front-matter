import * as React from 'react';

export interface IIconProps {
  name: string;
}

export const Icon: React.FunctionComponent<IIconProps> = ({ name }: React.PropsWithChildren<IIconProps>) => {
  
  return (<i className={`codicon codicon-${name}`}></i>);
};