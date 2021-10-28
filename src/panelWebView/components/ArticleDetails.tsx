import * as React from 'react';
import { VsTable, VsTableBody, VsTableHeader, VsTableHeaderCell, VsTableRow, VsTableCell } from './VscodeComponents';

export interface IArticleDetailsProps {
  details: {
    headings: number;
    paragraphs: number;
    wordCount: number;
    internalLinks: number;
    externalLinks: number;
    images: number;
  }
}

const ArticleDetails: React.FunctionComponent<IArticleDetailsProps> = ({details}: React.PropsWithChildren<IArticleDetailsProps>) => {
  
  if (!details || (details.headings === undefined && details.paragraphs === undefined)) {
    return null;
  }

  return (
    <div className={`seo__status__details valid`}>
      <h4>More details</h4>

      <VsTable bordered>
        <VsTableHeader slot="header">
          <VsTableHeaderCell>Type</VsTableHeaderCell>
          <VsTableHeaderCell>Total</VsTableHeaderCell>
        </VsTableHeader>
        <VsTableBody slot="body">
          { 
            details?.headings !== undefined && (
              <VsTableRow>
                <VsTableCell>Headings</VsTableCell>
                <VsTableCell>{details.headings}</VsTableCell>
              </VsTableRow>
            ) 
          }

          {
            details?.paragraphs !== undefined && (
              <VsTableRow>
                <VsTableCell>Paragraphs</VsTableCell>
                <VsTableCell>{details.paragraphs}</VsTableCell>
              </VsTableRow>
            )
          }

          {
            details?.internalLinks !== undefined && (
              <VsTableRow>
                <VsTableCell>Internal links</VsTableCell>
                <VsTableCell>{details.internalLinks}</VsTableCell>
              </VsTableRow>
            )
          }

          {
            details?.externalLinks !== undefined && (
              <VsTableRow>
                <VsTableCell>External links</VsTableCell>
                <VsTableCell>{details.externalLinks}</VsTableCell>
              </VsTableRow>
            )
          }

          {
            details?.images !== undefined && (
              <VsTableRow>
                <VsTableCell>Images</VsTableCell>
                <VsTableCell>{details.images}</VsTableCell>
              </VsTableRow>
            )
          }
        </VsTableBody>
      </VsTable>
    </div>
  );
};

ArticleDetails.displayName = 'ArticleDetails';
export { ArticleDetails };