import * as React from 'react';
import { Navigation } from '../Navigation';
import { Footer } from './Footer';
import { Sponsors } from './Sponsors';

export interface ILayoutProps {}

export const Layout: React.FunctionComponent<ILayoutProps> = (props: React.PropsWithChildren<ILayoutProps>) => {

  return (
    <div className={`flex flex-col h-screen`}>
      <header className={`lg:sticky w-full lg:top-0 z-50 bg-vulcan-500 bg-opacity-80 backdrop-blur-lg`}>
        <Navigation />
      </header>

      <main className={`flex-grow`}>
        {props.children}
      </main>

      <Sponsors />

      <Footer />
    </div>
  );
};