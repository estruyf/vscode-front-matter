import * as React from 'react';
import { SeoKeywordInfo } from './SeoKeywordInfo';
import { VsTable, VsTableBody, VsTableCell, VsTableHeader, VsTableHeaderCell, VsTableRow } from './VscodeComponents';

export interface ISeoKeywordsProps {
  keywords: string[] | null;

  title: string;
  description: string;
  slug: string;
  content: string;
}

export const SeoKeywords: React.FunctionComponent<ISeoKeywordsProps> = ({keywords, ...data}: React.PropsWithChildren<ISeoKeywordsProps>) => {

  const validateKeywords = () => {
    if (!keywords) {
      return [];
    }

    if (typeof keywords === 'string') {
      return [keywords];
    }

    if (Array.isArray(keywords)) {
      return keywords;
    }

    return [];
  }

  if (!keywords || keywords.length === 0) {
    return null;
  }

  return (
    <div className={`seo__status__keywords`}>
      <h4>Keywords</h4>

      <VsTable bordered>
        <VsTableHeader slot="header">
          <VsTableHeaderCell className={`table__cell`}>Keyword</VsTableHeaderCell>
          <VsTableHeaderCell className={`table__cell`}>Title</VsTableHeaderCell>
          <VsTableHeaderCell className={`table__cell`}>Description</VsTableHeaderCell>
          <VsTableHeaderCell className={`table__cell`}>Slug</VsTableHeaderCell>
          <VsTableHeaderCell className={`table__cell`}>Content</VsTableHeaderCell>
        </VsTableHeader>
        <VsTableBody slot="body">
          {
            validateKeywords().map((keyword, index) => {
              return (
                <SeoKeywordInfo key={index} keyword={keyword} {...data} />
              );
            })
          }
        </VsTableBody>
      </VsTable>
      
      
    </div>
  );
};