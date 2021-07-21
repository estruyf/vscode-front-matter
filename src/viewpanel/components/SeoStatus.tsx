import * as React from 'react';
import { SEO } from '../../models/PanelSettings';
import { ArticleDetails } from './ArticleDetails';
import { Collapsible } from './Collapsible';
import { SeoDetails } from './SeoDetails';
import { SeoKeywords } from './SeoKeywords';

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
    console.log(`render`);

    if (!isOpen) {
      return null;
    }

    return (
      <div>
        { (title && seo.title > 0) && <SeoDetails title="Title" valueTitle="Length" allowedLength={seo.title} value={title.length} /> }
        
        { (data[descriptionField] && seo.description > 0) && <SeoDetails title="Description" valueTitle="Length" allowedLength={seo.description} value={data[descriptionField].length} /> }

        {
          seo.content > 0 && data?.articleDetails?.wordCount && (
            <SeoDetails title="Article length" 
                        valueTitle="Words" 
                        allowedLength={seo.content} 
                        value={data?.articleDetails?.wordCount}
                        noValidation />
          )
        }

        <SeoKeywords keywords={data?.keywords} />

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