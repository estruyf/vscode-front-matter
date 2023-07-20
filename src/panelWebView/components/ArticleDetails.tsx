import * as React from 'react';
import {
  VsTable,
  VsTableBody,
  VsTableHeader,
  VsTableHeaderCell,
  VsTableRow,
  VsTableCell
} from './VscodeComponents';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export interface IArticleDetailsProps {
  details: {
    headings: number;
    paragraphs: number;
    wordCount: number;
    internalLinks: number;
    externalLinks: number;
    images: number;
  };
}

const ArticleDetails: React.FunctionComponent<IArticleDetailsProps> = ({
  details
}: React.PropsWithChildren<IArticleDetailsProps>) => {
  if (!details || (details.headings === undefined && details.paragraphs === undefined)) {
    return null;
  }

  return (
    <div className={`seo__status__details valid`}>
      <h4>{l10n.t(LocalizationKey.panelArticleDetailsTitle)}</h4>

      <VsTable bordered>
        <VsTableHeader slot="header">
          <VsTableHeaderCell>
            {l10n.t(LocalizationKey.panelArticleDetailsType)}
          </VsTableHeaderCell>
          <VsTableHeaderCell>
            {l10n.t(LocalizationKey.panelArticleDetailsTotal)}
          </VsTableHeaderCell>
        </VsTableHeader>
        <VsTableBody slot="body">
          {details?.headings !== undefined && (
            <VsTableRow>
              <VsTableCell>{l10n.t(LocalizationKey.panelArticleDetailsHeadings)}</VsTableCell>
              <VsTableCell>{details.headings}</VsTableCell>
            </VsTableRow>
          )}

          {details?.paragraphs !== undefined && (
            <VsTableRow>
              <VsTableCell>{l10n.t(LocalizationKey.panelArticleDetailsParagraphs)}</VsTableCell>
              <VsTableCell>{details.paragraphs}</VsTableCell>
            </VsTableRow>
          )}

          {details?.internalLinks !== undefined && (
            <VsTableRow>
              <VsTableCell>{l10n.t(LocalizationKey.panelArticleDetailsInternalLinks)}</VsTableCell>
              <VsTableCell>{details.internalLinks}</VsTableCell>
            </VsTableRow>
          )}

          {details?.externalLinks !== undefined && (
            <VsTableRow>
              <VsTableCell>{l10n.t(LocalizationKey.panelArticleDetailsExternalLinks)}</VsTableCell>
              <VsTableCell>{details.externalLinks}</VsTableCell>
            </VsTableRow>
          )}

          {details?.images !== undefined && (
            <VsTableRow>
              <VsTableCell>{l10n.t(LocalizationKey.panelArticleDetailsImages)}</VsTableCell>
              <VsTableCell>{details.images}</VsTableCell>
            </VsTableRow>
          )}
        </VsTableBody>
      </VsTable>
    </div>
  );
};

ArticleDetails.displayName = 'ArticleDetails';
export { ArticleDetails };
