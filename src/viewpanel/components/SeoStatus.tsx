import * as React from 'react';
import { SEO } from '../../models/PanelSettings';
import { ArticleDetails } from './ArticleDetails';
import { Collapsible } from './Collapsible';
import { SeoDetails } from './SeoDetails';
import { SeoFieldInfo } from './SeoFieldInfo';
import { SeoKeywords } from './SeoKeywords';
import { ValidInfo } from './ValidInfo';
import { VsTable, VsTableBody, VsTableCell, VsTableHeader, VsTableHeaderCell, VsTableRow } from './VscodeComponents';

export interface ISeoStatusProps {
  seo: SEO;
  data: any;
}

export const SeoStatus: React.FunctionComponent<ISeoStatusProps> = (props: React.PropsWithChildren<ISeoStatusProps>) => {
  const { data, seo } = props;
  const { title } = data;
  const [ isOpen, setIsOpen ] = React.useState(true);

  const { descriptionField } = seo;

  if (!title && !data[descriptionField]) {
    return null;
  }

  const renderContent = () => {
    if (!isOpen) {
      return null;
    }

    return (
      <div>
        <div className={`seo__status__details`}>
          <h4>Recommendations</h4>

          <VsTable bordered>
            <VsTableHeader slot="header">
              <VsTableHeaderCell className={`table__cell`}>Property</VsTableHeaderCell>
              <VsTableHeaderCell className={`table__cell`}>Length</VsTableHeaderCell>
              <VsTableHeaderCell className={`table__cell`}>Recommended</VsTableHeaderCell>
              <VsTableHeaderCell className={`table__cell`}>Valid</VsTableHeaderCell>
            </VsTableHeader>
            <VsTableBody slot="body">
              { 
                (title && seo.title > 0) && (
                  <SeoFieldInfo title={`title`} value={`${title.length} chars`} recommendation={`${seo.title} chars`} isValid={title.length <= seo.title} />
                )
              }

              {
                (data[descriptionField] && seo.description > 0) && (
                  <SeoFieldInfo title={descriptionField} value={`${data[descriptionField].length} chars`} recommendation={`${seo.description} chars`} isValid={data[descriptionField].length <= seo.description} />
                )
              }

              {
                (seo.content > 0 && data?.articleDetails?.wordCount) && (
                  <SeoFieldInfo title={`Article length`} value={`${data?.articleDetails?.wordCount} words`} recommendation={`${seo.content} words`} />
                )
              }
            </VsTableBody>
          </VsTable>
        </div>

        <SeoKeywords keywords={data?.keywords}
                     title={title} 
                     description={data[descriptionField]} 
                     slug={data.slug}
                     content={data?.articleDetails?.content} />

        <ArticleDetails details={data.articleDetails} />
      </div>
    );
  };

  return (
    <Collapsible title="SEO Status" sendUpdate={(value) => setIsOpen(value)}>
      { renderContent() }
    </Collapsible>
  );
};