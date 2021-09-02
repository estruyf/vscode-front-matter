import * as React from 'react';
// const docsearch = require('@docsearch/js');
// import { useEffect } from 'react';
import { DocSearch } from '@docsearch/react';

export interface ISearchboxProps {}

export const Searchbox: React.FunctionComponent<ISearchboxProps> = (props: React.PropsWithChildren<ISearchboxProps>) => {

  return (
    <>
      <DocSearch 
        apiKey={process.env.NEXT_PUBLIC_AGOLIA_APIKEY || ""} 
        indexName={process.env.NEXT_PUBLIC_AGOLIA_INDEX || ""} 
        appId={process.env.NEXT_PUBLIC_AGOLIA_APPID || ""} 
        disableUserPersonalization={true} 
        />
    </>
  );
};