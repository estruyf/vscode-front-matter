import * as React from 'react';
import { SeoKeywordInfo } from './SeoKeywordInfo';
import { ErrorBoundary } from '@sentry/react';
import { Tooltip } from 'react-tooltip'
import { LocalizationKey, localize } from '../../localization';
import { VSCodeTable, VSCodeTableBody, VSCodeTableHead, VSCodeTableHeader, VSCodeTableRow } from './VSCode/VSCodeTable';
import { Icon } from 'vscrui';

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

  const tooltipClasses = `!py-[2px] !px-[8px] !rounded-[3px] !border-[var(--vscode-editorHoverWidget-border)] !border !border-solid !bg-[var(--vscode-editorHoverWidget-background)] !text-[var(--vscode-editorHoverWidget-foreground)] !font-normal !opacity-100`;

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
      <VSCodeTable>
        <VSCodeTableHeader>
          <VSCodeTableRow className={`border-t border-t-[var(--vscode-editorGroup-border)]`}>
            <VSCodeTableHead>
              {localize(LocalizationKey.panelSeoKeywordsHeaderKeyword)}
            </VSCodeTableHead>
            <VSCodeTableHead className='text-center'>
              <div
                className='flex items-center justify-center h-full'
              >
                <Icon
                  className='!text-[var(--vscode-foreground)]'
                  name='quote'
                  data-tooltip-id="tooltip-title"
                  data-tooltip-content={localize(LocalizationKey.commonTitle)} />
                <Tooltip id="tooltip-title" className={tooltipClasses} style={{
                  fontSize: '12px',
                  lineHeight: '19px'
                }} />
              </div>
            </VSCodeTableHead>
            <VSCodeTableHead className='text-center'>
              <div
                className='flex items-center justify-center h-full'
              >
                <Icon
                  className='!text-[var(--vscode-foreground)]'
                  name='note'
                  data-tooltip-id="tooltip-description"
                  data-tooltip-content={localize(LocalizationKey.commonDescription)} />
                <Tooltip id="tooltip-description" className={tooltipClasses} style={{
                  fontSize: '12px',
                  lineHeight: '19px'
                }} />
              </div>
            </VSCodeTableHead>
            <VSCodeTableHead className='text-center'>
              <div
                className='flex items-center justify-center h-full'
              >
                <Icon
                  className='!text-[var(--vscode-foreground)]'
                  name='link'
                  data-tooltip-id="tooltip-slug"
                  data-tooltip-content={localize(LocalizationKey.commonSlug)} />
                <Tooltip id="tooltip-slug" className={tooltipClasses} style={{
                  fontSize: '12px',
                  lineHeight: '19px'
                }} />
              </div>
            </VSCodeTableHead>
            <VSCodeTableHead className='text-center'>
              <div
                className='flex items-center justify-center h-full'
              >
                <Icon
                  className='!text-[var(--vscode-foreground)]'
                  name='book'
                  data-tooltip-id="tooltip-content"
                  data-tooltip-content={localize(LocalizationKey.panelSeoKeywordInfoValidInfoContent)} />
                <Tooltip id="tooltip-content" className={tooltipClasses} style={{
                  fontSize: '12px',
                  lineHeight: '19px'
                }} />
              </div>
            </VSCodeTableHead>
            <VSCodeTableHead className='text-center'>
              <div
                className='flex items-center justify-center h-full'
              >
                <span
                  className='text-[var(--vscode-foreground)] cursor-default select-none'
                  data-tooltip-id="tooltip-heading"
                  data-tooltip-content={localize(LocalizationKey.panelSeoKeywordInfoValidInfoLabel)}
                >
                  H1
                </span>
                <Tooltip id="tooltip-heading" className={tooltipClasses} style={{
                  fontSize: '12px',
                  lineHeight: '19px'
                }} />
              </div>
            </VSCodeTableHead>
            <VSCodeTableHead className='text-center'>
              <div
                className='flex items-center justify-center h-full'
              >
                <Icon
                  className='!text-[var(--vscode-foreground)]'
                  name='percentage'
                  data-tooltip-id="tooltip-density"
                  data-tooltip-content={localize(LocalizationKey.panelSeoKeywordsDensity)} />
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
              <ErrorBoundary key={keyword} fallback={<div />}>
                <SeoKeywordInfo key={index} keywords={validKeywords} keyword={keyword} {...data} />
              </ErrorBoundary>
            );
          })}
        </VSCodeTableBody>
      </VSCodeTable>

      {data.wordCount && (
        <div className={`text-xs mt-2`}>
          {localize(LocalizationKey.panelSeoKeywordsDensityDescription)}
        </div>
      )}
    </section>
  );
};

SeoKeywords.displayName = 'SeoKeywords';
export { SeoKeywords };
