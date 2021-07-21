import * as React from 'react';

export interface ISeoKeywordsProps {
  keywords: string[] | null;
}

export const SeoKeywords: React.FunctionComponent<ISeoKeywordsProps> = ({keywords}: React.PropsWithChildren<ISeoKeywordsProps>) => {
  return (
    <div className={`seo__status__keywords`}>
      <h4>Keywords</h4>
      
      <p>{keywords?.join(',')}</p>
    </div>
  );
};