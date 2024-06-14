import * as React from 'react';
import { SeoKeywordInfo } from './SeoKeywordInfo';
import { ErrorBoundary } from '@sentry/react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { VSCodeTable, VSCodeTableBody, VSCodeTableHead, VSCodeTableHeader, VSCodeTableRow } from './VSCode/VSCodeTable';

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

      <VSCodeTable>
        <VSCodeTableHeader>
          <VSCodeTableRow>
            <VSCodeTableHead>
              {l10n.t(LocalizationKey.panelSeoKeywordsHeaderKeyword)}
            </VSCodeTableHead>
            <VSCodeTableHead>
              {l10n.t(LocalizationKey.panelSeoKeywordsHeaderDetails)}
            </VSCodeTableHead>
          </VSCodeTableRow>
        </VSCodeTableHeader>

        <VSCodeTableBody>
          {validateKeywords().map((keyword, index) => {
            return (
              <ErrorBoundary key={keyword} fallback={<div />}>
                <SeoKeywordInfo key={index} keyword={keyword} {...data} />
              </ErrorBoundary>
            );
          })}
        </VSCodeTableBody>
      </VSCodeTable>

      {data.wordCount && (
        <div className={`text-xs mt-2`}>
          {l10n.t(LocalizationKey.panelSeoKeywordsDensity)}
        </div>
      )}
    </div>
  );
};

SeoKeywords.displayName = 'SeoKeywords';
export { SeoKeywords };
