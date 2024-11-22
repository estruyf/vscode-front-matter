import * as React from 'react';
import { PanelSettings, SEO } from '../../models/PanelSettings';
import { TagType } from '../TagType';
import { ArticleDetails } from './ArticleDetails';
import { Collapsible } from './Collapsible';
import FieldBoundary from './ErrorBoundary/FieldBoundary';
import { SeoFieldInfo } from './SeoFieldInfo';
import { SeoKeywords } from './SeoKeywords';
import { TagPicker } from './Fields/TagPicker';
import { LocalizationKey, localize } from '../../localization';
import { VSCodeTable, VSCodeTableBody } from './VSCode/VSCodeTable';
import useContentType from '../../hooks/useContentType';
import { Icon } from 'vscrui';

export interface ISeoStatusProps {
  seo: SEO;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  settings: PanelSettings | undefined;
  focusElm: TagType | null;
  unsetFocus: () => void;
}

const SeoStatus: React.FunctionComponent<ISeoStatusProps> = ({
  metadata,
  seo,
  settings,
  focusElm,
  unsetFocus
}: React.PropsWithChildren<ISeoStatusProps>) => {
  const contentType = useContentType(settings, metadata);
  const { slug } = metadata;

  const { descriptionField, titleField } = seo;

  const tableContent = React.useMemo(() => {
    const titleFieldName = contentType?.fields.find(f => f.name === titleField)?.title || titleField;
    const descriptionFieldName = contentType?.fields.find(f => f.name === descriptionField)?.title || descriptionField;

    return (
      <div className='seo space-y-8'>
        <section className={`seo__insights`}>
          <h4 className='!text-left'>{localize(LocalizationKey.panelSeoStatusTitle)}</h4>

          <VSCodeTable>
            <VSCodeTableBody>
              {metadata[titleField] && seo.title > 0 ? (
                <SeoFieldInfo
                  title={titleFieldName}
                  value={metadata[titleField].length}
                  recommendation={localize(LocalizationKey.panelSeoStatusSeoFieldInfoCharacters, seo.title)}
                  isValid={metadata[titleField].length <= seo.title}
                  className={`border-t border-t-[var(--vscode-editorGroup-border)]`}
                />
              ) : null}

              {slug && seo.slug > 0 ? (
                <SeoFieldInfo
                  title={`slug`}
                  value={slug.length}
                  recommendation={localize(LocalizationKey.panelSeoStatusSeoFieldInfoCharacters, seo.slug)}
                  isValid={slug.length <= seo.slug}
                />
              ) : null}

              {metadata[descriptionField] && seo.description > 0 ? (
                <SeoFieldInfo
                  title={descriptionFieldName}
                  value={metadata[descriptionField].length}
                  recommendation={localize(LocalizationKey.panelSeoStatusSeoFieldInfoCharacters, seo.description)}
                  isValid={metadata[descriptionField].length <= seo.description}
                />
              ) : null}

              {seo.content > 0 && metadata?.articleDetails?.wordCount > 0 ? (
                <SeoFieldInfo
                  title={localize(LocalizationKey.panelSeoStatusSeoFieldInfoArticle)}
                  value={metadata?.articleDetails?.wordCount}
                  recommendation={localize(LocalizationKey.panelSeoStatusSeoFieldInfoWords, seo.content)}
                />
              ) : null}

              <ArticleDetails details={metadata.articleDetails} />
            </VSCodeTableBody>
          </VSCodeTable>
        </section>

        <section className={`seo__keywords`}>
          <SeoKeywords
            keywords={metadata?.keywords}
            title={metadata[titleField]}
            description={metadata[descriptionField]}
            slug={metadata.slug}
            headings={metadata?.articleDetails?.headingsText}
            wordCount={metadata?.articleDetails?.wordCount}
            content={metadata?.articleDetails?.content}
          />

          <FieldBoundary fieldName={`Keywords`}>
            <TagPicker
              type={TagType.keywords}
              icon={<Icon name="symbol-keyword" className='mr-2' />}
              crntSelected={(metadata.keywords as string[]) || []}
              options={[]}
              freeform={true}
              focussed={focusElm === TagType.keywords}
              unsetFocus={unsetFocus}
              disableConfigurable
            />
          </FieldBoundary>
        </section>
      </div>
    );
  }, [contentType, metadata, seo, focusElm, unsetFocus]);

  return (
    <Collapsible id={`seo`} title={localize(LocalizationKey.panelSeoStatusCollapsibleTitle)}>
      {!metadata[titleField] && !metadata[descriptionField] ? (
        <div className={`seo__status__empty`}>
          <p>
            {localize(LocalizationKey.panelSeoStatusRequired, titleField, descriptionField)}
          </p>
        </div>
      ) : (
        tableContent
      )}
    </Collapsible>
  );
};

SeoStatus.displayName = 'SeoStatus';
export { SeoStatus };
