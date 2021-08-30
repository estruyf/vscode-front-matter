import * as React from 'react';

export interface ILinkProps {
  title: string;
  link: string;
}

export const Link: React.FunctionComponent<ILinkProps> = ({title, link}: React.PropsWithChildren<ILinkProps>) => {
  return (
    <a className="transition-colors duration-200 relative block text-whisper-500 hover:text-teal-900" 
       href={link}>
      {title}
    </a>
  );
};