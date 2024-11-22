import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VSCodeTableCell, VSCodeTableRow } from './VSCode/VSCodeTable';
import { Tag } from './Tag';
import { LocalizationKey, localize } from '../../localization';
import { Messenger } from '@estruyf/vscode/dist/client';
import { CommandToCode } from '../CommandToCode';

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
    const densityTitle = `${density.toFixed(2)}% *`;

    if (density < 0.75) {
      return <ValidInfo label={densityTitle} isValid={false} className='text-xs' />;
    } else if (density >= 0.75 && density < 1.5) {
      return <ValidInfo label={densityTitle} isValid={true} className='text-xs' />;
    } else {
      return <ValidInfo label={densityTitle} isValid={false} className='text-xs' />;
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
    return <ValidInfo isValid={exists.length > 0} />;
  };

  const onRemove = React.useCallback((tag: string) => {
    const newSelection = keywords.filter((s) => s !== tag);
    Messenger.send(CommandToCode.updateKeywords, {
      values: newSelection,
      parents: undefined
    });
  }, [keywords]);

  if (!keyword || typeof keyword !== 'string') {
    return null;
  }

  return (
    <VSCodeTableRow>
      <VSCodeTableCell>
        <div className='flex h-full items-center'>
          <Tag
            value={keyword}
            className={`!mx-0 !my-1 !px-2 !py-1`}
            onRemove={onRemove}
            onCreate={() => void 0}
            title={localize(LocalizationKey.panelTagsTagWarning, keyword)}
            disableConfigurable={true}
          />
        </div>
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        <ValidInfo
          isValid={!!title && title.toLowerCase().includes(keyword.toLowerCase())}
        />
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        <ValidInfo
          isValid={!!description && description.toLowerCase().includes(keyword.toLowerCase())}
        />
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        <ValidInfo
          isValid={
            !!slug &&
            (slug.toLowerCase().includes(keyword.toLowerCase()) ||
              slug.toLowerCase().includes(keyword.replace(/ /g, '-').toLowerCase()))
          }
        />
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        <ValidInfo
          isValid={!!content && content.toLowerCase().includes(keyword.toLowerCase())}
        />
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        {checkHeadings()}
      </VSCodeTableCell>
      <VSCodeTableCell className={`text-center`}>
        {density()}
      </VSCodeTableCell>
    </VSCodeTableRow>
  );
};

SeoKeywordInfo.displayName = 'SeoKeywordInfo';
export { SeoKeywordInfo };
