import * as React from 'react';

export interface ICenterIconProps {}

export const CenterIcon: React.FunctionComponent<ICenterIconProps> = (props: React.PropsWithChildren<ICenterIconProps>) => {
  return (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
      <rect x="1.2" y="0.6" stroke="currentcolor" strokeMiterlimit="10" width="13.6" height="14.8"/>
      <path stroke="currentcolor" d="M2.6,10V9h10.8v1H2.6z M2.6,6h10.8v1H2.6V6z M13.4,3v1H2.6V3H13.4z M2.6,12v1h10.8v-1H2.6z"/>
    </svg>
  );
};