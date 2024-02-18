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

  const openFile = (filePath: string) => {
    messageHandler.send(DashboardMessage.openFile, filePath);
  }

  const dropdown = React.useMemo(() => {
    console.log(page)
    if (!page.fmLocale || !page.fmTranslations || Object.keys(page.fmTranslations).length < 1) {
      return null;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="text-xs flex items-center focus:outline-none border rounded border-[var(--frontmatter-border)] p-1">
          <LanguageIcon className={`mr-2 h-4 w-4`} aria-hidden="true" />
          <span>{page.fmLocale.title || page.fmLocale.locale}</span>
          <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align='start'>
          <MenuItem
            title={page.fmLocale.title || page.fmLocale.locale}
            value={page.fmFilePath}
            onClick={(value) => openFile(value)} />

          <DropdownMenuSeparator />

          {
            Object.entries(page.fmTranslations).map(([key, value]) => {
              return (
                <MenuItem
                  key={key}
                  title={value.locale.title || value.locale.locale}
                  value={value.path}
                  onClick={(value) => openFile(value)} />
              );
            })
          }
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }, [page])

  if (!page.fmLocale) {
    return null;
  }

  return (
    <div className="mb-2 flex items-center">
      {/* <LanguageIcon className="mr-1 h-4 w-4 inline-block" />
      <span className="text-xs">{page.fmLocale.title || page.fmLocale.locale}</span> */}

      {dropdown}
    </div>
  );
};