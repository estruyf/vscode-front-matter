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
      { (title && seo.title > 0) && <SeoDetails title="Title" allowedLength={seo.title} value={title} /> }
      { (data[descriptionField] && seo.description > 0) && <SeoDetails title="Description" allowedLength={seo.description} value={data[descriptionField]} /> }
    </div>
  );
};