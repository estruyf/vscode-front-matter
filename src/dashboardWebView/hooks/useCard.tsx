import { useMemo } from 'react';
import { CardFields, Page } from '../models';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../localization';

export default function useCard(
  pageData: Page,
  cardFields: CardFields | undefined,
) {

  const escapedTitle = useMemo(() => {
    let value = pageData.title;

    if (cardFields?.title) {
      if (cardFields.title === "description") {
        value = pageData.description;
      } else if (cardFields?.title !== "title") {
        value = pageData[cardFields?.title] || pageData.title;
      }
    } else if (cardFields?.title === null) {
      return null;
    }

    if (value && typeof value !== 'string') {
      return l10n.t(LocalizationKey.dashboardContentsItemInvalidTitle);
    }

    return value;
  }, [pageData.title, pageData.description, cardFields?.title, pageData]);

  const escapedDescription = useMemo(() => {
    let value = pageData.description;

    if (cardFields?.description) {
      if (cardFields.description === "title") {
        value = pageData.title;
      } else if (cardFields?.description !== "description") {
        value = pageData[cardFields?.description] || pageData.description;
      }
    } else if (cardFields?.description === null) {
      return null;
    }

    if (value && typeof value !== 'string') {
      return l10n.t(LocalizationKey.dashboardContentsItemInvalidDescription);
    }

    return value;
  }, [pageData.description, pageData.title, cardFields?.description, pageData]);

  return {
    escapedTitle,
    escapedDescription
  };
}