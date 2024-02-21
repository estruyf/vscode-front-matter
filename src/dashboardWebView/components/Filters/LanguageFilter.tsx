import * as React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuSeparator } from '../../../components/shadcn/Dropdown';
import { LanguageIcon } from '@heroicons/react/24/outline';
import { MenuButton, MenuItem } from '../Menu';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DEFAULT_LOCALE_STATE, LocaleAtom, LocalesAtom } from '../../state';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export interface ILanguageFilterProps { }

export const LanguageFilter: React.FunctionComponent<ILanguageFilterProps> = ({ }: React.PropsWithChildren<ILanguageFilterProps>) => {
  const locales = useRecoilValue(LocalesAtom);
  const [crntLocale, setCrntLocale] = useRecoilState(LocaleAtom);

  const crntLocaleName = React.useMemo(() => {
    if (!crntLocale || !locales || locales.length === 0) {
      return null;
    }

    const locale = locales.find(locale => locale.locale === crntLocale);

    return locale?.title || locale?.locale;
  }, [crntLocale, locales]);

  if (!locales || locales.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu>
      <MenuButton
        label={
          <>
            <LanguageIcon className={`inline-block w-4 h-4 mr-2`} />
            <span>{l10n.t(LocalizationKey.dashboardFiltersLanguageFilterLabel)}</span>
          </>
        }
        title={crntLocaleName || l10n.t(LocalizationKey.dashboardFiltersLanguageFilterAll)}
      />

      <DropdownMenuContent align='start'>
        <MenuItem
          title={l10n.t(LocalizationKey.dashboardFiltersLanguageFilterAll)}
          value={null}
          isCurrent={crntLocale === DEFAULT_LOCALE_STATE}
          onClick={() => setCrntLocale(DEFAULT_LOCALE_STATE)}
        />

        <DropdownMenuSeparator />

        {
          locales.map((locale) => (
            <MenuItem
              key={locale.locale}
              title={locale.title || locale.locale}
              value={locale.locale}
              isCurrent={locale.locale === crntLocale}
              onClick={(value) => setCrntLocale(value)}
            />
          ))
        }
      </DropdownMenuContent>
    </DropdownMenu>
  );
};