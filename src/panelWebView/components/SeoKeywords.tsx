import * as React from 'react';
import { SeoKeywordInfo } from './SeoKeywordInfo';
import { VsTable, VsTableBody, VsTableHeader, VsTableHeaderCell } from './VscodeComponents';
import { ErrorBoundary } from '@sentry/react';

export interface ISeoKeywordsProps {
  keywords: string[] | null;

  title: string;
  description: string;
  slug: string;
  content: string;
  headings?: string[];
  wordCount?: number;
}

const SeoKeywords: React.FunctionComponent<ISeoKeywordsProps> = ({keywords, ...data}: React.PropsWithChildren<ISeoKeywordsProps>) => {
  const [ isReady, setIsReady ] = React.useState(false);

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

  // Workaround for lit components not updating render
  React.useEffect(() => {
    setIsReady(false);
    setTimeout(() => {
      setIsReady(true);
    }, 0);
  }, [keywords]);

  if (!isReady || !keywords || keywords.length === 0) {
    return null;
  }

  return (
    <div className={`seo__status__keywords`}>
      <h4>Keywords</h4>

      <VsTable bordered columns={["30%", "auto"]}>
        <VsTableHeader slot="header">
          <VsTableHeaderCell className={`table__cell`}>Keyword</VsTableHeaderCell>
          <VsTableHeaderCell className={`table__cell`}>Details</VsTableHeaderCell>
        </VsTableHeader>
        <VsTableBody slot="body">
          {
            validateKeywords().map((keyword, index) => {
              return (
                <ErrorBoundary key={keyword} fallback={<div />}>
                  <SeoKeywordInfo key={index} keyword={keyword} {...data} />
                </ErrorBoundary>
              );
            })
          }
        </VsTableBody>
      </VsTable>

      {
        data.wordCount && (
          <div className={`seo__status__note`}>
            * A keyword density of 1-1.5% is sufficient in most cases.
          </div>
        )
      }
    </div>
  );
};

SeoKeywords.displayName = 'SeoKeywords';
export { SeoKeywords };