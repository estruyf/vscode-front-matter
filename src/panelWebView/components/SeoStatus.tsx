import * as React from 'react';
import { SEO } from '../../models/PanelSettings';
import { TagType } from '../TagType';
import { ArticleDetails } from './ArticleDetails';
import { Collapsible } from './Collapsible';
import FieldBoundary from './ErrorBoundary/FieldBoundary';
import { SymbolKeywordIcon } from './Icons/SymbolKeywordIcon';
import { SeoFieldInfo } from './SeoFieldInfo';
import { SeoKeywords } from './SeoKeywords';
import { TagPicker } from './Fields/TagPicker';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { VSCodeTable, VSCodeTableBody, VSCodeTableHead, VSCodeTableHeader, VSCodeTableRow } from './VSCode/VSCodeTable';

export interface ISeoStatusProps {
  seo: SEO;
  data: any;
  focusElm: TagType | null;
  unsetFocus: () => void;
}

const SeoStatus: React.FunctionComponent<ISeoStatusProps> = ({
  data,
  seo,
  focusElm,
  unsetFocus
}: React.PropsWithChildren<ISeoStatusProps>) => {
  const { title, slug } = data;

  const { descriptionField, titleField } = seo;

  const tableContent = React.useMemo(() => {
    return (
      <div>
        <div className={`seo__status__details`}>
          <h4>{l10n.t(LocalizationKey.panelSeoStatusTitle)}</h4>

          <VSCodeTable>
            <VSCodeTableHeader>
              <VSCodeTableRow>
                <VSCodeTableHead>{l10n.t(LocalizationKey.panelSeoStatusHeaderProperty)}</VSCodeTableHead>
                <VSCodeTableHead>{l10n.t(LocalizationKey.panelSeoStatusHeaderLength)}</VSCodeTableHead>
                <VSCodeTableHead>{l10n.t(LocalizationKey.panelSeoStatusHeaderValid)}</VSCodeTableHead>
              </VSCodeTableRow>
            </VSCodeTableHeader>

            <VSCodeTableBody>
              {data[titleField] && seo.title > 0 ? (
                <SeoFieldInfo
                  title={titleField}
                  value={data[titleField].length}
                  recommendation={l10n.t(LocalizationKey.panelSeoStatusSeoFieldInfoCharacters, seo.title)}
                  isValid={data[titleField].length <= seo.title}
                />
              ) : null}

              {slug && seo.slug > 0 ? (
                <SeoFieldInfo
                  title={`slug`}
                  value={slug.length}
                  recommendation={l10n.t(LocalizationKey.panelSeoStatusSeoFieldInfoCharacters, seo.slug)}
                  isValid={slug.length <= seo.slug}
                />
              ) : null}

              {data[descriptionField] && seo.description > 0 ? (
                <SeoFieldInfo
                  title={descriptionField}
                  value={data[descriptionField].length}
                  recommendation={l10n.t(LocalizationKey.panelSeoStatusSeoFieldInfoCharacters, seo.description)}
                  isValid={data[descriptionField].length <= seo.description}
                />
              ) : null}

              {seo.content > 0 && data?.articleDetails?.wordCount > 0 ? (
                <SeoFieldInfo
                  title={l10n.t(LocalizationKey.panelSeoStatusSeoFieldInfoArticle)}
                  value={data?.articleDetails?.wordCount}
                  recommendation={l10n.t(LocalizationKey.panelSeoStatusSeoFieldInfoWords, seo.content)}
                />
              ) : null}
            </VSCodeTableBody>
          </VSCodeTable>
        </div>

        <SeoKeywords
          keywords={data?.keywords}
          title={title}
          description={data[descriptionField]}
          slug={data.slug}
          headings={data?.articleDetails?.headingsText}
          wordCount={data?.articleDetails?.wordCount}
          content={data?.articleDetails?.content}
        />

        <FieldBoundary fieldName={`Keywords`}>
          <TagPicker
            type={TagType.keywords}
            icon={<SymbolKeywordIcon />}
            crntSelected={(data.keywords as string[]) || []}
            options={[]}
            freeform={true}
            focussed={focusElm === TagType.keywords}
            unsetFocus={unsetFocus}
            disableConfigurable
          />
        </FieldBoundary>

        <ArticleDetails details={data.articleDetails} />
      </div>
    );
  }, [data, seo, focusElm, unsetFocus]);

  return (
    <Collapsible id={`seo`} title={l10n.t(LocalizationKey.panelSeoStatusCollapsibleTitle)}>
      {!title && !data[descriptionField] ? (
        <div className={`seo__status__empty`}>
          <p>
            {l10n.t(LocalizationKey.panelSeoStatusRequired, "Title", descriptionField)}
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
