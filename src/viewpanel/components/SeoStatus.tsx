import * as React from 'react';
import { SEO } from '../../models/PanelSettings';
import { Icon } from './Icon';
import { SeoDetails } from './SeoDetails';

export interface ISeoStatusProps {
  seo: SEO;
  data: any;
}

export const SeoStatus: React.FunctionComponent<ISeoStatusProps> = (props: React.PropsWithChildren<ISeoStatusProps>) => {
  const { data, seo } = props;
  const { title } = data;

  const { descriptionField } = seo;

  if (!title && !data[descriptionField]) {
    return null;
  }

  return (
    <div className="section seo__status">
      <h3>
        <Icon name="search" /> SEO Status
      </h3>

      { (title && seo.title > 0) && <SeoDetails title="Title" valueTitle="Length" allowedLength={seo.title} value={title.length} /> }
      
      { (data[descriptionField] && seo.description > 0) && <SeoDetails title="Description" valueTitle="Length" allowedLength={seo.description} value={data[descriptionField].length} /> }

      { data?.articleDetails !== null && (
        <div className={`seo__status__details valid`}>
          <h4><strong>Article details</strong></h4>
          <ul>
            { data?.articleDetails?.headings && <li><b>Headings</b>: {data?.articleDetails?.headings}</li> }
            { data?.articleDetails?.paragraphs && <li><b>Paragraphs</b>: {data?.articleDetails?.paragraphs}</li> }
            { data?.articleDetails?.wordCount && <li><b>Words</b>: {data?.articleDetails?.wordCount}</li> }
          </ul>
        </div>
      ) }
    </div>
  );
};