import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VSCodeTableCell, VSCodeTableRow } from './VSCode/VSCodeTable';

export interface ISeoKeywordInfoProps {
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

  if (!keyword || typeof keyword !== 'string') {
    return null;
  }

  return (
    <VSCodeTableRow>
      <VSCodeTableCell>{keyword}</VSCodeTableCell>
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
