import * as React from 'react';
import { Navigation } from '../Navigation';
import { Footer } from './Footer';

export interface ILayoutProps {}

export const Layout: React.FunctionComponent<ILayoutProps> = (props: React.PropsWithChildren<ILayoutProps>) => {
  return (
    <div className={`flex flex-col h-screen`}>
      <header>
        <Navigation />
      </header>

      <main className={`flex-grow`}>
        {props.children}
      </main>

      <Footer />
    </div>
  );
};