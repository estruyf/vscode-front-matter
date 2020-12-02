import * as React from 'react';
import { SEO } from '../../models/PanelSettings';
import { SeoDetails } from './SeoDetails';

export interface ISeoStatusProps {
  seo: SEO;
  data: any;
}

export const SeoStatus: React.FunctionComponent<ISeoStatusProps> = (props: React.PropsWithChildren<ISeoStatusProps>) => {
  const { data, seo } = props;
  const { title, description } = data;

  if (!title && !description) {
    return null;
  }

  return (
    <div className="seo__status">
      <h3>SEO Status</h3>
      { (title && seo.title > 0) && <SeoDetails title="Title" allowedLength={seo.title} value={title} /> }
      { (description && seo.description > 0) && <SeoDetails title="Description" allowedLength={seo.description} value={description} /> }
    </div>
  );
};