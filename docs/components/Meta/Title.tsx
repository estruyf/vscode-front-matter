import * as React from 'react';
import Head from 'next/head';
import { Extension } from '../../constants/extension';

export interface ITitleProps {
  value: string;
}

export const Title: React.FunctionComponent<ITitleProps> = ({value}: React.PropsWithChildren<ITitleProps>) => {
  return (
    <Head>
      <title>{value} | {Extension.name}</title>
      <meta name="title" content={`${value} | ${Extension.name}`} />
      <meta property="og:title" content={`${value} | ${Extension.name}`} />
      <meta property="twitter:title" content={`${value} | ${Extension.name}`} />
    </Head>
  );
};