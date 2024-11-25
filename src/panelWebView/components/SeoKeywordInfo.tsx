import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VSCodeTableCell, VSCodeTableRow } from './VSCode/VSCodeTable';
import { Tag } from './Tag';
import { LocalizationKey, localize } from '../../localization';
import { Messenger } from '@estruyf/vscode/dist/client';
import { CommandToCode } from '../CommandToCode';
import { Tooltip } from 'react-tooltip'

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

  const tooltipClasses = `!py-[2px] !px-[8px] !rounded-[3px] !border-[var(--vscode-editorHoverWidget-border)] !border !border-solid !bg-[var(--vscode-editorHoverWidget-background)] !text-[var(--vscode-editorHoverWidget-foreground)] !font-normal !opacity-100 shadow-[0_2px_8px_var(--vscode-widget-shadow)] !z-[9999]`;

  const density = () => {
    if (!wordCount) {
      return null;
    }

    const pattern = new RegExp(`(^${keyword.toLowerCase()}(?=\\s|$))|(\\s${keyword.toLowerCase()}(?=\\s|$))`, 'ig');
    const count = (content.match(pattern) || []).length;
    const density = (count / wordCount) * 100;
    const densityTitle = `${density.toFixed(2)}* %`;

    if (density < 0.75) {
      return <span className='text-[12px] text-[var(--vscode-statusBarItem-warningBackground)]'>{densityTitle}</span>;
    } else if (density >= 0.75 && density < 1.5) {
      return <span className='text-[12px] text-[#1f883d]'>{densityTitle}</span>;
    } else {
      return <span className='text-[12px] text-[var(--vscode-statusBarItem-warningBackground)]'>{densityTitle}</span>;
    }
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
        <span className='inline-flex items-center gap-1'>{localize(LocalizationKey.commonTitle)}: <ValidInfo isValid={checks.title} /></span><br />
        <span className='inline-flex items-center gap-1'>{localize(LocalizationKey.commonDescription)}: <ValidInfo isValid={checks.description} /></span><br />
        <span className='inline-flex items-center gap-1'>{localize(LocalizationKey.commonSlug)}: <ValidInfo isValid={checks.slug} /></span><br />
        <span className='inline-flex items-center gap-1'>{localize(LocalizationKey.panelSeoKeywordInfoValidInfoContent)}: <ValidInfo isValid={checks.content} /></span><br />
        <span className='inline-flex items-center gap-1'>{localize(LocalizationKey.panelSeoKeywordInfoValidInfoLabel)}: <ValidInfo isValid={!!checks.heading} /></span>
      </>
    )
  }, [checks]);

  const checksMarkup = React.useMemo(() => {
    const validData = Object.values(checks).filter((check) => check).length;
    const totalChecks = Object.values(checks).length;

    const isValid = validData === totalChecks;

    return (
      <div 
        className={`inline-flex py-1 px-[4px] rounded-[3px] justify-center items-center text-[12px] leading-[16px] border border-solid ${isValid ? "text-[#1f883d] border-[#1f883d]" : "text-[var(--vscode-statusBarItem-warningBackground)] border-[var(--vscode-statusBarItem-warningBackground)]"}`}
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
            className={`!w-full !justify-between !mx-0 !my-1 !px-2 !py-1`}
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
          className={tooltipClasses} 
          style={{
            fontSize: '12px',
            lineHeight: '19px'
          }}
          render={() => tooltipContent} />
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        {density()}
      </VSCodeTableCell>
    </VSCodeTableRow>
  );
};

SeoKeywordInfo.displayName = 'SeoKeywordInfo';
export { SeoKeywordInfo };
