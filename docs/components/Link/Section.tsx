import Link from 'next/link';
import * as React from 'react';

export interface ISectionProps {
  title: string;
  link: string;
}

export const Section: React.FunctionComponent<ISectionProps> = ({title, link}: React.PropsWithChildren<ISectionProps>) => {
  
  return (
    <Link href={link}>
      <a className={`mb-3 lg:mb-3 uppercase tracking-wide font-semibold text-sm text-whisper-900 hover:text-teal-900`} title={title}>
        {title}
      </a>
    </Link>
  );
};