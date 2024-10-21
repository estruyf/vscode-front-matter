import { XCircleIcon } from '@heroicons/react/24/solid';
import * as React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import {
  FolderSelector,
  TagSelector,
  CategorySelector,
  SortingAtom,
  FolderAtom,
  DEFAULT_FOLDER_STATE,
  TagAtom,
  CategoryAtom,
  DEFAULT_TAG_STATE,
  DEFAULT_CATEGORY_STATE,
  FiltersAtom,
  LocaleAtom,
  DEFAULT_LOCALE_STATE
} from '../../state';
import { DefaultValue } from 'recoil';
import { useEffect, useMemo } from 'react';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export const guardRecoilDefaultValue = (candidate: unknown): candidate is DefaultValue => {
  if (candidate instanceof DefaultValue) {
    return true;
  }
  return false;
};

export interface IClearFiltersProps { }

export const ClearFilters: React.FunctionComponent<IClearFiltersProps> = () => {
  const [show, setShow] = React.useState(false);

  const folder = useRecoilValue(FolderSelector);
  const tag = useRecoilValue(TagSelector);
  const category = useRecoilValue(CategorySelector);
  const locale = useRecoilValue(LocaleAtom);
  const filters = useRecoilValue(FiltersAtom);

  const resetSorting = useResetRecoilState(SortingAtom);
  const resetFolder = useResetRecoilState(FolderAtom);
  const resetTag = useResetRecoilState(TagAtom);
  const resetCategory = useResetRecoilState(CategoryAtom);
  const resetLocale = useResetRecoilState(LocaleAtom);
  const resetFilters = useResetRecoilState(FiltersAtom);

  const reset = () => {
    setShow(false);
    resetSorting();
    resetFolder();
    resetTag();
    resetCategory();
    resetLocale();
    resetFilters();
  };

  const hasCustomFilters = useMemo(() => {
    const names = Object.keys(filters);
    return names.some((name) => filters[name]);
  }, [filters]);

  useEffect(() => {
    if (
      folder !== DEFAULT_FOLDER_STATE ||
      tag !== DEFAULT_TAG_STATE ||
      category !== DEFAULT_CATEGORY_STATE ||
      locale !== DEFAULT_LOCALE_STATE ||
      hasCustomFilters
    ) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [folder, tag, category, locale, hasCustomFilters]);

  if (!show) {
    return null;
  }

  return (
    <button
      className={`flex items-center hover:text-[var(--vscode-statusBarItem-errorBackground)]`}
      onClick={reset}
      title={l10n.t(LocalizationKey.dashboardHeaderClearFiltersTitle)}
    >
      <XCircleIcon className={`inline-block w-5 h-5 mr-1`} />
      <span>{l10n.t(LocalizationKey.commonClear)}</span>
    </button>
  );
};
