import * as React from 'react';
import { Page } from '../../models';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../../../components/shadcn/Dropdown';
import { MenuItem } from '../Menu';
import { DashboardMessage } from '../../DashboardMessage';
import { messageHandler } from '@estruyf/vscode/dist/client';

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