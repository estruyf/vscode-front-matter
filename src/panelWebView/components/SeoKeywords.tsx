import * as React from 'react';
import { SeoKeywordInfo } from './SeoKeywordInfo';
import { ErrorBoundary } from '@sentry/react';
import { LocalizationKey, localize } from '../../localization';
import { VSCodeTable, VSCodeTableBody, VSCodeTableHead, VSCodeTableHeader, VSCodeTableRow } from './VSCode/VSCodeTable';
import { Tooltip } from 'react-tooltip'

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

  const tooltipClasses = `!py-[2px] !px-[8px] !rounded-[3px] !border-[var(--vscode-editorHoverWidget-border)] !border !border-solid !bg-[var(--vscode-editorHoverWidget-background)] !text-[var(--vscode-editorHoverWidget-foreground)] !font-normal !opacity-100 shadow-[0_2px_8px_var(--vscode-widget-shadow)]`;

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

  const validKeywords = React.useMemo(() => {
    return validateKeywords();
  }, [keywords]);

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
    <section className={`seo__keywords__table`}>
      <VSCodeTable disableOverflow>
        <VSCodeTableHeader>
          <VSCodeTableRow className={`border-t border-t-[var(--vscode-editorGroup-border)]`}>
            <VSCodeTableHead>
              {localize(LocalizationKey.panelSeoKeywordsHeaderKeyword)}
            </VSCodeTableHead>
            <VSCodeTableHead>
              {localize(LocalizationKey.panelSeoKeywordsChecks)}
            </VSCodeTableHead>
            
            <VSCodeTableHead className='text-center'>
              <div
                className='flex items-center justify-center h-full'
              >
                <span
                  data-tooltip-id="tooltip-density"
                  data-tooltip-content={localize(LocalizationKey.panelSeoKeywordsDensity)}>
                  {localize(LocalizationKey.panelSeoKeywordsDensityTableTitle)}
                </span>
                <Tooltip id="tooltip-density" className={tooltipClasses} style={{
                  fontSize: '12px',
                  lineHeight: '19px'
                }} />
              </div>
            </VSCodeTableHead>
          </VSCodeTableRow>
        </VSCodeTableHeader>

        <VSCodeTableBody>
          {validKeywords.map((keyword, index) => {
            return (
              <ErrorBoundary key={`${keyword}-${index}`} fallback={<div />}>
                <SeoKeywordInfo keywords={validKeywords} keyword={keyword} {...data} />
              </ErrorBoundary>
            );
          })}
        </VSCodeTableBody>
      </VSCodeTable>

      {data.wordCount && (
        <div className={`text-xs my-2`}>
          {localize(LocalizationKey.panelSeoKeywordsDensityDescription)}
        </div>
      )}
    </section>
  );
};

SeoKeywords.displayName = 'SeoKeywords';
export { SeoKeywords };
