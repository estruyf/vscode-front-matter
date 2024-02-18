import * as React from 'react';
import { Page } from '../../models';
import { LanguageIcon } from '@heroicons/react/24/outline';

export interface II18nLabelProps {
  page: Page;
}

export const I18nLabel: React.FunctionComponent<II18nLabelProps> = ({
  page
}: React.PropsWithChildren<II18nLabelProps>) => {
  if (!page.fmLocale) {
    return null;
  }

  return (
    <div className="mb-2 flex items-center">
      <LanguageIcon className="mr-1 h-4 w-4 inline-block" />
      <span className="text-xs">{page.fmLocale.title || page.fmLocale.locale}</span>
    </div>
  );
};