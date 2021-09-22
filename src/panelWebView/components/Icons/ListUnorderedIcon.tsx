import * as React from 'react';

export interface IListUnorderedIconProps {}

export const ListUnorderedIcon: React.FunctionComponent<IListUnorderedIconProps> = (props: React.PropsWithChildren<IListUnorderedIconProps>) => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M2 3H1v1h1V3zm0 3H1v1h1V6zM1 9h1v1H1V9zm1 3H1v1h1v-1zm2-9h11v1H4V3zm11 3H4v1h11V6zM4 9h11v1H4V9zm11 3H4v1h11v-1z"/></svg>
  );
};