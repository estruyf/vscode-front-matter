import * as React from 'react';
// const docsearch = require('@docsearch/js');
// import { useEffect } from 'react';
import { DocSearch } from '@docsearch/react';

export interface ISearchboxProps {}

export const Searchbox: React.FunctionComponent<ISearchboxProps> = (props: React.PropsWithChildren<ISearchboxProps>) => {

  return (
    <>
      <DocSearch 
        apiKey={`00a3aec5d2fd408fdfce332b0b8c8dcb`} 
        indexName={`documentation`} 
        appId={`ITVR93WPJF`} 
        disableUserPersonalization={true} 
        />
    </>
  );
};