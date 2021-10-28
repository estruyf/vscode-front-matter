import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VsTableCell, VsTableRow } from './VscodeComponents';

export interface ISeoKeywordInfoProps {
  keyword: string;
  title: string;
  description: string;
  slug: string;
  content: string;
  wordCount?: number;
  headings?: string[];
}

const SeoKeywordInfo: React.FunctionComponent<ISeoKeywordInfoProps> = ({keyword, title, description, slug, content, wordCount, headings}: React.PropsWithChildren<ISeoKeywordInfoProps>) => {

  const density = () => {
    if (!wordCount) {
      return null;
    }

    const pattern = new RegExp('\\b' + keyword.toLowerCase() + '\\b', 'ig');
    const count = (content.match(pattern) || []).length;
    const density = (count / wordCount) * 100;
    const densityTitle = `Keyword usage ${density.toFixed(2)}% *`;

    if (density < 0.75) {
      return <ValidInfo label={densityTitle} isValid={false} />
    } else if (density >= 0.75 && density < 1.5) {
      return <ValidInfo label={densityTitle} isValid={true} />
    } else {
      return <ValidInfo label={densityTitle} isValid={false} />
    }
  };

  const checkHeadings = () => {    
    if (!headings || headings.length === 0) {
      return null;
    }

    const exists = headings.filter(heading => heading.split(' ').findIndex(word => word.toLowerCase() === keyword.toLowerCase()) !== -1);
    return <ValidInfo label={`Used in heading(s)`} isValid={exists.length > 0} />;
  }; 

  if (!keyword) {
    return null;
  }

  return (
    <VsTableRow>
      <VsTableCell className={`table__cell`}>{keyword}</VsTableCell>
      <VsTableCell className={`table__cell table__cell__validation table__cell__seo_details`}>
        <div>
          <ValidInfo label={`Title`} isValid={!!title && title.toLowerCase().includes(keyword.toLowerCase())} />
        </div>
        <div>
          <ValidInfo label={`Description`} isValid={!!description && description.toLowerCase().includes(keyword.toLowerCase())} />
        </div>
        <div>
          <ValidInfo label={`Slug`} isValid={!!slug && (slug.toLowerCase().includes(keyword.toLowerCase()) || slug.toLowerCase().includes(keyword.replace(/ /g, '-').toLowerCase()))} />
        </div>
        <div>
          <ValidInfo label={`Content`} isValid={!!content && content.toLowerCase().includes(keyword.toLowerCase())} />
        </div>
        {
          headings && headings.length > 0 && (
            <div>
              {checkHeadings()}
            </div>
          )
        }
        {
          wordCount && (
            <div>
              {density()}
            </div>
          )
        }
      </VsTableCell>
    </VsTableRow>
  );
};

SeoKeywordInfo.displayName = 'SeoKeywordInfo';
export { SeoKeywordInfo };