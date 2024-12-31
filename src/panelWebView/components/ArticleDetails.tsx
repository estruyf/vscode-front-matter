import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';
import { VSCodeTableCell, VSCodeTableRow } from './VSCode/VSCodeTable';

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
    <>
      {details?.headings !== undefined && (
        <VSCodeTableRow>
          <VSCodeTableCell>{l10n.t(LocalizationKey.panelArticleDetailsHeadings)}</VSCodeTableCell>
          <VSCodeTableCell>{details.headings}</VSCodeTableCell>
        </VSCodeTableRow>
      )}

      {details?.paragraphs !== undefined && (
        <VSCodeTableRow>
          <VSCodeTableCell>{l10n.t(LocalizationKey.panelArticleDetailsParagraphs)}</VSCodeTableCell>
          <VSCodeTableCell>{details.paragraphs}</VSCodeTableCell>
        </VSCodeTableRow>
      )}

      {details?.internalLinks !== undefined && (
        <VSCodeTableRow>
          <VSCodeTableCell>{l10n.t(LocalizationKey.panelArticleDetailsInternalLinks)}</VSCodeTableCell>
          <VSCodeTableCell>{details.internalLinks}</VSCodeTableCell>
        </VSCodeTableRow>
      )}

      {details?.externalLinks !== undefined && (
        <VSCodeTableRow>
          <VSCodeTableCell>{l10n.t(LocalizationKey.panelArticleDetailsExternalLinks)}</VSCodeTableCell>
          <VSCodeTableCell>{details.externalLinks}</VSCodeTableCell>
        </VSCodeTableRow>
      )}

      {details?.images !== undefined && (
        <VSCodeTableRow>
          <VSCodeTableCell>{l10n.t(LocalizationKey.panelArticleDetailsImages)}</VSCodeTableCell>
          <VSCodeTableCell>{details.images}</VSCodeTableCell>
        </VSCodeTableRow>
      )}
    </>
  );
};

ArticleDetails.displayName = 'ArticleDetails';
export { ArticleDetails };
