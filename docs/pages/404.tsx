import * as React from 'react';
import { Description, OtherMeta, Title } from '../components/Meta';
import { Layout } from '../components/Page';
import Image from 'next/image';

export interface INotFoundProps {}

const NotFound: React.FunctionComponent<INotFoundProps> = (props: React.PropsWithChildren<INotFoundProps>) => {
  return (
    <>
      <Title value={`Page not found`} />
      <Description value={`It seems you ended up on a page that we didn't write yet.`} />
      <OtherMeta image={`/assets/frontmatter-preview.png`} />
      
      <Layout>
        <div className="h-full max-w-7xl mx-auto py-12 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center">
          <Image width={1216} height={825} src={`/assets/404.png`} alt={`Page not found`} />
          <span className="sr-only">
            Page not found - please navigate back to the homepage
          </span>
        </div>
      </Layout> 
    </>
  );
};

export default NotFound;