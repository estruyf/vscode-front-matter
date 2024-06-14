import * as React from 'react';
import * as l10n from '@vscode/l10n';
import { DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '../../../components/shadcn/Dropdown';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { openFile } from '../../utils/MessageHandlers';
import { I18nConfig } from '../../../models';
import { LocalizationKey } from '../../../localization';

export interface ITranslationMenuProps {
  isDefaultLocale?: boolean;
  locale?: I18nConfig;
  translations?: {
    [locale: string]: {
      locale: I18nConfig;
      path: string;
    };
  };
}

export const TranslationMenu: React.FunctionComponent<ITranslationMenuProps> = ({
  isDefaultLocale,
  locale,
  translations,
}: React.PropsWithChildren<ITranslationMenuProps>) => {

  const otherLocales = React.useMemo(() => {
    if (!translations) {
      return [];
    }

    return Object.entries(translations).filter(([key]) => key !== locale?.locale);
  }, [translations]);

  const crntLocale = React.useMemo(() => {
    if (!locale?.locale || !translations || !translations[locale.locale]) {
      return null;
    }

    return translations[locale.locale];
  }, [translations, locale]);


  if (!locale || !translations || Object.keys(translations).length === 0) {
    return null;
  }

  if (otherLocales.length === 0 || !crntLocale) {
    return null;
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <LanguageIcon className={`mr-2 h-4 w-4`} aria-hidden={true} />
        <span>{l10n.t(LocalizationKey.dashboardContentsContentActionsTranslationsMenu)}</span>
      </DropdownMenuSubTrigger>

      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem onClick={() => openFile(crntLocale.path)}>
            <span>{crntLocale.locale.title || crntLocale.locale.locale}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {
            otherLocales.map(([key, value]) => (
              <DropdownMenuItem
                key={key}
                onClick={() => openFile(value.path)}
              >
                <span>{value.locale.title || value.locale.locale}</span>
              </DropdownMenuItem>
            ))
          }
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
};