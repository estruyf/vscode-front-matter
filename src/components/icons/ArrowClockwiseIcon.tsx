import * as React from 'react';

export interface IArrowClockwiseIconProps {
  className?: string;
}

export const ArrowClockwiseIcon: React.FunctionComponent<IArrowClockwiseIconProps> = ({ className }: React.PropsWithChildren<IArrowClockwiseIconProps>) => {
  return (
    <svg className={className || 'h-4 w-4'} fill="currentColor" aria-hidden="true" width="1em" height="1em" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.07 9.05a7 7 0 0 1 12.55-3.22l.13.17H12.5a.5.5 0 1 0 0 1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-1 0v2.2a8 8 0 1 0 1.99 4.77.5.5 0 0 0-1 .08 7 7 0 1 1-13.92-.5Z" fill="currentColor"></path>
    </svg>
  );
};