import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VSCodeTableCell, VSCodeTableRow } from './VSCode/VSCodeTable';
import { Tag } from './Tag';
import { LocalizationKey, localize } from '../../localization';
import { Messenger } from '@estruyf/vscode/dist/client';
import { CommandToCode } from '../CommandToCode';
import { Tooltip } from '../../components/common/Tooltip';

export interface ISeoKeywordInfoProps {
  keywords: string[];
  keyword: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  wordCount?: number;
  headings?: string[];
}

const SeoKeywordInfo: React.FunctionComponent<ISeoKeywordInfoProps> = ({
  keyword,
  keywords,
  title,
  description,
  slug,
  content,
  wordCount,
  headings
}: React.PropsWithChildren<ISeoKeywordInfoProps>) => {

  const density = () => {
    if (!wordCount) {
      return null;
    }

    const pattern = new RegExp(`(^${keyword.toLowerCase()}(?=\\s|$))|(\\s${keyword.toLowerCase()}(?=\\s|$))`, 'ig');
    const count = (content.match(pattern) || []).length;
    const density = (count / wordCount) * 100;
    const densityTitle = `${density.toFixed(2)}* %`;
    const color = (density >= 0.75 && density < 1.5) ? "--vscode-charts-green" : "--vscode-charts-yellow";
    return (
      <span 
        className={`text-[12px] text-[var(${color})] cursor-default`} 
        data-tooltip-id={`tooltip-density-${keyword}`}
        data-tooltip-content={localize(LocalizationKey.panelSeoKeywordInfoDensityTooltip)}>
        {densityTitle}
      </span>
    );
  };

  const validateKeywords = (heading: string, keyword: string) => {
    const keywords = keyword.toLowerCase().split(' ');

    if (keywords.length > 1) {
      return heading.toLowerCase().includes(keyword.toLowerCase());
    } else {
      return (
        heading
          .toLowerCase()
          .split(' ')
          .findIndex((word) => word.toLowerCase() === keyword.toLowerCase()) !== -1
      );
    }
  };

  const checkHeadings = () => {
    if (!headings || headings.length === 0) {
      return null;
    }

    const exists = headings.filter((heading) => validateKeywords(heading, keyword));
    return exists.length > 0;
  };

  const onRemove = React.useCallback((tag: string) => {
    const newSelection = keywords.filter((s) => s !== tag);
    Messenger.send(CommandToCode.updateKeywords, {
      values: newSelection,
      parents: undefined
    });
  }, [keywords]);

  const checks = React.useMemo(() => {
    return {
      title: !!title && title.toLowerCase().includes(keyword.toLowerCase()),
      description: !!description && description.toLowerCase().includes(keyword.toLowerCase()),
      slug:
        !!slug &&
        (slug.toLowerCase().includes(keyword.toLowerCase()) ||
          slug.toLowerCase().includes(keyword.replace(/ /g, '-').toLowerCase())),
      content: !!content && content.toLowerCase().includes(keyword.toLowerCase()),
      heading: checkHeadings()
    };
  }, [title, description, slug, content, headings, wordCount]);

  const tooltipContent = React.useMemo(() => {
    return (
      <>
        <h4>Keyword present in:</h4>
        <span className='inline-flex items-center gap-1'><ValidInfo isValid={checks.title} /> {localize(LocalizationKey.commonTitle)}</span><br />
        <span className='inline-flex items-center gap-1'><ValidInfo isValid={checks.description} /> {localize(LocalizationKey.commonDescription)}</span><br />
        <span className='inline-flex items-center gap-1'><ValidInfo isValid={checks.slug} /> {localize(LocalizationKey.commonSlug)}</span><br />
        <span className='inline-flex items-center gap-1'><ValidInfo isValid={checks.content} /> {localize(LocalizationKey.panelSeoKeywordInfoValidInfoContent)}</span><br />
        <span className='inline-flex items-center gap-1'><ValidInfo isValid={!!checks.heading} /> {localize(LocalizationKey.panelSeoKeywordInfoValidInfoLabel)}</span>
      </>
    )
  }, [checks]);

  const checksMarkup = React.useMemo(() => {
    const validData = Object.values(checks).filter((check) => check).length;
    const totalChecks = Object.values(checks).length;

    const isValid = validData === totalChecks;

    return (
      <div 
        className={`inline-flex py-0.5 px-2 my-1 rounded-[3px] justify-center items-center text-[12px] leading-[16px] border border-solid cursor-default 
          ${isValid 
            ? "text-[var(--vscode-charts-green)] border-[var(--vscode-charts-green)] bg-[var(--frontmatter-success-background)]" 
            : "text-[var(--vscode-charts-yellow)] border-[var(--vscode-charts-yellow)] bg-[var(--frontmatter-warning-background)]"}`}
        data-tooltip-id={`tooltip-checks-${keyword}`}
      >
        <ValidInfo isValid={isValid} />
        <span className='mr-[1px]'>{validData}</span>
        <span>/</span>
        <span className='ml-[1px]'>{totalChecks}</span>
      </div>
    );
  }, [checks]);

  if (!keyword || typeof keyword !== 'string') {
    return null;
  }

  return (
    <VSCodeTableRow>
      <VSCodeTableCell>
        <div className='flex h-full items-center'>
          <Tag
            value={keyword}
            className={`!w-full !justify-between !mx-0 !my-1 !px-2 !py-0.5`}
            onRemove={onRemove}
            onCreate={() => void 0}
            title={localize(LocalizationKey.panelTagsTagWarning, keyword)}
            disableConfigurable={true}
          />
        </div>
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        {checksMarkup}

        <Tooltip 
          id={`tooltip-checks-${keyword}`}
          render={() => tooltipContent} />
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        {density()}

        <Tooltip 
          id={`tooltip-density-${keyword}`} />
      </VSCodeTableCell>
    </VSCodeTableRow>
  );
};

SeoKeywordInfo.displayName = 'SeoKeywordInfo';
export { SeoKeywordInfo };
