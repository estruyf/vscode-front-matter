import * as React from 'react';

export interface IToggleIconProps {}

export const ToggleIcon: React.FunctionComponent<IToggleIconProps> = (
  props: React.PropsWithChildren<IToggleIconProps>
) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentcolor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <circle cx="16" cy="12" r="2" />
      <rect x="2" y="6" width="20" height="12" rx="6" />
    </svg>
  );
};
