import * as React from 'react';
import { Extension } from '../../constants/extension';
import { navigation } from '../../constants/navigation';

export interface IFooterProps {}

export const Footer: React.FunctionComponent<IFooterProps> = (props: React.PropsWithChildren<IFooterProps>) => {
  return (
    <footer className="bg-vulcan-600">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.name} className="px-5 py-2">
              <a href={item.href} title={item.title} className="text-base text-gray-400 hover:text-gray-500">
                {item.name}
              </a>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex justify-center space-x-6">
          <a href="https://visitorbadge.io/status?path=https%3A%2F%2Ffrontmatter.codes" title={`Daily Front Matter visitors`} rel={`noopener noreferrer`}>
            <img src="https://api.visitorbadge.io/api/visitors?path=https%3A%2F%2Ffrontmatter.codes&countColor=%23060A15&labelColor=%23060A15" alt={`Visitors`} />
          </a>
          
          <a href={Extension.extensionLink} title={`Extension installs`} rel={`noopener noreferrer`}>
            <img src={`https://vsmarketplacebadge.apphb.com/installs-short/eliostruyf.vscode-front-matter.svg?style=for-the-badge&color=060A15&labelColor=060A15`} alt={`Installations of the extension`} />
          </a>

          {navigation.social.map((item) => (
            <a key={item.name} title={item.title} href={item.href} className="text-gray-400 hover:text-gray-500" rel={`noopener noreferrer`}>
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <p className="mt-8 text-center text-base text-whisper-900">&copy; 2021 {Extension.name}. All rights reserved.</p>
      </div>
    </footer>
  );
};