import * as React from 'react';
import { PageFrontMatter } from '../../models/PageFrontMatter';
import { PageInfo } from './PageInfo';
import { Sidebar } from './Sidebar';

export interface IPageProps {
  items: PageFrontMatter[];
  page: PageFrontMatter | undefined;
}

export const Page: React.FunctionComponent<IPageProps> = ({items, page, children}: React.PropsWithChildren<IPageProps>) => {
  
  
  return (
    <div className={`mb-6 py-8 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`}>
      <div className={`lg:flex`}>

        <aside className={`h-screen top-16 lg:block hidden lg:w-80 xl:w-96`}>
          <Sidebar items={items} />
        </aside>

        <div className={`min-w-0 w-full flex-auto lg:static lg:max-h-full lg:overflow-visible`}>
          {children}

          <PageInfo page={page} />
        </div>
      </div>
    </div>
  );
};

