import * as React from 'react';
import { navigation } from '../../constants/navigation';
import { Logo } from '../Images';
import Link from 'next/link';
import { Extension } from '../../constants/extension';
import { useRouter } from 'next/router';
import { Searchbox } from '../Page/Searchbox';
import { isProduction } from '../../helpers/isProduction';

export interface INavigationProps {}

export const Navigation: React.FunctionComponent<INavigationProps> = (props: React.PropsWithChildren<INavigationProps>) => {
  const router = useRouter();
  
  return (
    <>
      {
        !isProduction() ? (
          <div className={`bg-yellow-500 text-center py-2 px-4`}>
            <a href={`https://frontmatter.codes`} title={`Go to main release documentation`} className={`text-base font-medium text-vulcan-500 hover:text-vulcan-900`}>
              You are currently viewing the BETA version of Front Matter documentation. Click on the banner to go to the main release documentation.
            </a>
          </div>
        ) : null
      }

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

              <iframe src="https://ghbtns.com/github-btn.html?user=estruyf&repo=vscode-front-matter&type=star&count=true" frameBorder="0" scrolling="0" width="85" height="20" title="GitHub"></iframe>
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
        <div className="py-4 flex flex-wrap justify-center items-center space-x-6 lg:hidden">
          {navigation.social.map((link) => (
            <a key={link.name} href={link.href} title={link.title} className={`text-base font-medium text-whisper-500 hover:text-whisper-900`} rel={`noopener noreferrer`}>
              <span className="sr-only">{link.name}</span>
              <link.icon className="inline-block h-6 w-6" aria-hidden="true" />
            </a>
          ))}

          <iframe src="https://ghbtns.com/github-btn.html?user=estruyf&repo=vscode-front-matter&type=star&count=true" frameBorder="0" scrolling="0" width="85" height="20" title="GitHub"></iframe>
        </div>
      </nav>
    </>
  );
};
