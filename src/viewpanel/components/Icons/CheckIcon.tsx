import * as React from 'react';

export interface ICheckIconProps {}

export const CheckIcon: React.FunctionComponent<ICheckIconProps> = (props: React.PropsWithChildren<ICheckIconProps>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M14.431 3.323l-8.47 10-.79-.036-3.35-4.77.818-.574 2.978 4.24 8.051-9.506.764.646z"/></svg>
  );
};