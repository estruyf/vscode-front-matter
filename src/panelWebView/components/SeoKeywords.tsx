import * as React from 'react';
import { SeoKeywordInfo } from './SeoKeywordInfo';
import { VsTable, VsTableBody, VsTableHeader, VsTableHeaderCell } from './VscodeComponents';
import { ErrorBoundary } from '@sentry/react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface ISeoKeywordsProps {
  keywords: string[] | null;

  title: string;
  description: string;
  slug: string;
  content: string;
  headings?: string[];
  wordCount?: number;
}

const SeoKeywords: React.FunctionComponent<ISeoKeywordsProps> = ({
  keywords,
  ...data
}: React.PropsWithChildren<ISeoKeywordsProps>) => {
  const [isReady, setIsReady] = React.useState(false);

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
  };

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
      <h4>{l10n.t(LocalizationKey.panelSeoKeywordsTitle)}</h4>

      <VsTable bordered columns={['30%', 'auto']}>
        <VsTableHeader slot="header">
          <VsTableHeaderCell className={`table__cell`}>
            {l10n.t(LocalizationKey.panelSeoKeywordsHeaderKeyword)}
          </VsTableHeaderCell>
          <VsTableHeaderCell className={`table__cell`}>
            {l10n.t(LocalizationKey.panelSeoKeywordsHeaderDetails)}
          </VsTableHeaderCell>
        </VsTableHeader>
        <VsTableBody slot="body">
          {validateKeywords().map((keyword, index) => {
            return (
              <ErrorBoundary key={keyword} fallback={<div />}>
                <SeoKeywordInfo key={index} keyword={keyword} {...data} />
              </ErrorBoundary>
            );
          })}
        </VsTableBody>
      </VsTable>

      {data.wordCount && (
        <div className={`seo__status__note`}>
          {l10n.t(LocalizationKey.panelSeoKeywordsDensity)}
        </div>
      )}
    </div>
  );
};

SeoKeywords.displayName = 'SeoKeywords';
export { SeoKeywords };
