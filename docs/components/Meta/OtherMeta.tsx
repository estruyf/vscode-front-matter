import Head from 'next/head';
import { useRouter } from 'next/router';
import * as React from 'react';
import { publicUrl } from '../../lib/publicUrl';

export interface IOtherMetaProps {
  image: string;
  type?: "website" | "article";
}

export const OtherMeta: React.FunctionComponent<IOtherMetaProps> = ({ image, type }: React.PropsWithChildren<IOtherMetaProps>) => {
  const router = useRouter();

  return (
    <Head>
      <link rel="canonical" href={`${publicUrl()}${router?.asPath || ""}`} />
      
      <meta property="og:type" content={type || "website"} />
      <meta property="twitter:card" content="summary_large_image" />

      <meta property="twitter:url" content={`${publicUrl()}${router?.asPath || ""}`} />
      <meta property="og:url" content={`${publicUrl()}${router?.asPath || ""}`} />

      <meta property="og:image" content={`${publicUrl()}/${image}`} />
      <meta property="twitter:image" content={`${publicUrl()}/${image}`} />
    </Head>
  );
};