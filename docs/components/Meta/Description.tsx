import Head from 'next/head';
import * as React from 'react';

export interface IDescriptionProps {
  value: string;
}

export const Description: React.FunctionComponent<IDescriptionProps> = ({value}: React.PropsWithChildren<IDescriptionProps>) => {
  return (
    <Head>
      <meta name="description" content={value} />
      <meta property="og:description" content={value} />
      <meta property="twitter:description" content={value} />
    </Head>
  );
};