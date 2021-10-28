import * as React from 'react';
import { SEO } from '../../models/PanelSettings';
import { ArticleDetails } from './ArticleDetails';
import { Collapsible } from './Collapsible';
import { SeoFieldInfo } from './SeoFieldInfo';
import { SeoKeywords } from './SeoKeywords';
import { VsTable, VsTableBody, VsTableHeader, VsTableHeaderCell } from './VscodeComponents';

export interface ISeoStatusProps {
  seo: SEO;
  data: any;
}

const SeoStatus: React.FunctionComponent<ISeoStatusProps> = (props: React.PropsWithChildren<ISeoStatusProps>) => {
  const { data, seo } = props;
  const { title, slug } = data;
  const [ isOpen, setIsOpen ] = React.useState(true);
  const tableRef = React.useRef<HTMLElement>();
  const pushUpdate = React.useRef((value: boolean) => {
    setTimeout(() => {
      setIsOpen(value);
    }, 10);
  }).current;

  const { descriptionField } = seo;

  // Workaround for lit components not updating render
  React.useEffect(() => {
    setTimeout(() => {
      let height = 0;

      tableRef.current?.childNodes.forEach((elm: any) => {
        height += elm.clientHeight;
      });

      if (height > 0 && tableRef.current) {
        tableRef.current.style.height = `${height}px`;
      }
    }, 10);
  }, [title, data[descriptionField], data?.articleDetails?.wordCount]);

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

          <VsTable ref={tableRef} bordered zebra>
            <VsTableHeader slot="header">
              <VsTableHeaderCell className={`table__cell`}>Property</VsTableHeaderCell>
              <VsTableHeaderCell className={`table__cell`}>Length</VsTableHeaderCell>
              <VsTableHeaderCell className={`table__cell`}>Valid</VsTableHeaderCell>
            </VsTableHeader>
            <VsTableBody slot="body">
              { 
                (title && seo.title > 0) && (
                  <SeoFieldInfo title={`title`} value={title.length} recommendation={`${seo.title} chars`} isValid={title.length <= seo.title} />
                )
              }
              { 
                (slug && seo.slug > 0) && (
                  <SeoFieldInfo title={`slug`} value={slug.length} recommendation={`${seo.slug} chars`} isValid={slug.length <= seo.slug} />
                )
              }

              {
                (data[descriptionField] && seo.description > 0) && (
                  <SeoFieldInfo title={descriptionField} value={data[descriptionField].length} recommendation={`${seo.description} chars`} isValid={data[descriptionField].length <= seo.description} />
                )
              }

              {
                (seo.content > 0 && data?.articleDetails?.wordCount > 0) && (
                  <SeoFieldInfo title={`Article length`} value={data?.articleDetails?.wordCount} recommendation={`${seo.content} words`} />
                )
              }
            </VsTableBody>
          </VsTable>
        </div>

        <SeoKeywords keywords={data?.keywords}
                     title={title} 
                     description={data[descriptionField]} 
                     slug={data.slug}
                     headings={data?.articleDetails?.headingsText}
                     wordCount={data?.articleDetails?.wordCount}
                     content={data?.articleDetails?.content} />

        <ArticleDetails details={data.articleDetails} />
      </div>
    );
  };

  

  return (
    <Collapsible id={`seo`} title="SEO Status" sendUpdate={pushUpdate}>
      { renderContent() }
    </Collapsible>
  );
};

SeoStatus.displayName = 'SeoStatus';
export { SeoStatus };