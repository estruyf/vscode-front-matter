import * as React from 'react';
import { ValidInfo } from './ValidInfo';
import { VsTableCell, VsTableRow } from './VscodeComponents';

export interface ISeoKeywordInfoProps {
  keyword: string;
  title: string;
  description: string;
  slug: string;
  content: string;
}

const SeoKeywordInfo: React.FunctionComponent<ISeoKeywordInfoProps> = ({keyword, title, description, slug, content}: React.PropsWithChildren<ISeoKeywordInfoProps>) => {

  if (!keyword) {
    return null;
  }

  return (
    <VsTableRow>
      <VsTableCell className={`table__cell`}>{keyword}</VsTableCell>
      <VsTableCell className={`table__cell table__cell__validation`}>
        <ValidInfo isValid={!!title && title.toLowerCase().includes(keyword.toLowerCase())} />
      </VsTableCell>
      <VsTableCell className={`table__cell table__cell__validation`}>
        <ValidInfo isValid={!!description && description.toLowerCase().includes(keyword.toLowerCase())} />
      </VsTableCell>
      <VsTableCell className={`table__cell table__cell__validation`}>
        <ValidInfo isValid={!!slug && (slug.toLowerCase().includes(keyword.toLowerCase()) || slug.toLowerCase().includes(keyword.replace(/ /g, '-').toLowerCase()))} />
      </VsTableCell>
      <VsTableCell className={`table__cell table__cell__validation`}>
        <ValidInfo isValid={!!content && content.toLowerCase().includes(keyword.toLowerCase())} />
      </VsTableCell>
    </VsTableRow>
  );
};

SeoKeywordInfo.displayName = 'SeoKeywordInfo';
export { SeoKeywordInfo };