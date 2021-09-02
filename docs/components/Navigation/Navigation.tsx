import * as React from 'react';
import { navigation } from '../../constants/navigation';
import { Logo } from '../Images';
import Link from 'next/link';
import { Extension } from '../../constants/extension';
import { useRouter } from 'next/router';
import { Searchbox } from '../Page/Searchbox';

export interface INavigationProps {}

export const Navigation: React.FunctionComponent<INavigationProps> = (props: React.PropsWithChildren<INavigationProps>) => {
  const router = useRouter();
  
  return (
    <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
      <div className="w-full py-6 flex items-center justify-center lg:justify-between border-b border-teal-500 lg:border-none">
        <div className="flex items-center">
          <Link href="/">
            <a title={Extension.name}>
              <span className="sr-only">{Extension.name}</span>
              <Logo className={`text-whisper-500 h-12 w-auto`} />
            </a>
          </Link>
        </div>
        <div className="space-x-4">
          <div className="hidden ml-10 space-x-8 lg:flex justify-center items-center">
            {navigation.main.map((link) => (
              <a key={link.name} href={link.href} title={link.title} className={`text-base font-medium text-whisper-500 hover:text-whisper-900 ${link.href === router.asPath ? `text-teal-800` : ``}`}>
                {link.name}
              </a>
            ))}
            {navigation.social.map((link) => (
              <a key={link.name} href={link.href} title={link.title} className={`text-base font-medium text-whisper-500 hover:text-whisper-900`} rel={`noopener noreferrer`}>
                <span className="sr-only">{link.name}</span>
                <link.icon className="inline-block h-6 w-6" aria-hidden="true" />
              </a>
            ))}

            <Searchbox />
          </div>
        </div>
      </div>
      <div className="py-4 flex flex-wrap justify-center space-x-6 lg:hidden">
        {navigation.main.map((link) => (
          <a key={link.name} href={link.href} title={link.title} className="text-base font-medium text-whisper-500 hover:text-whisper-900">
            {link.name}
          </a>
        ))}
      </div>
      <div className="py-4 flex flex-wrap justify-center space-x-6 lg:hidden">
        {navigation.social.map((link) => (
          <a key={link.name} href={link.href} title={link.title} className={`text-base font-medium text-whisper-500 hover:text-whisper-900`} rel={`noopener noreferrer`}>
            <span className="sr-only">{link.name}</span>
            <link.icon className="inline-block h-6 w-6" aria-hidden="true" />
          </a>
        ))}
      </div>
    </nav>
  );
};
