import * as React from 'react';

export interface IChatIconProps {
  className?: string;
}

export const ChatIcon: React.FunctionComponent<IChatIconProps> = ({ className }: React.PropsWithChildren<IChatIconProps>) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || 'h-4 w-4'} viewBox="0 0 32 32">
      <path fill="currentcolor" d="M16 19a6.99 6.99 0 0 1-5.833-3.129l1.666-1.107a5 5 0 0 0 8.334 0l1.666 1.107A6.99 6.99 0 0 1 16 19zm4-11a2 2 0 1 0 2 2a1.98 1.98 0 0 0-2-2zm-8 0a2 2 0 1 0 2 2a1.98 1.98 0 0 0-2-2z" />
      <path fill="currentcolor" d="M17.736 30L16 29l4-7h6a1.997 1.997 0 0 0 2-2V6a1.997 1.997 0 0 0-2-2H6a1.997 1.997 0 0 0-2 2v14a1.997 1.997 0 0 0 2 2h9v2H6a4 4 0 0 1-4-4V6a3.999 3.999 0 0 1 4-4h20a3.999 3.999 0 0 1 4 4v14a4 4 0 0 1-4 4h-4.835Z" />
    </svg>
  );
};