import { XCircleIcon } from '@heroicons/react/solid';
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
  DEFAULT_CATEGORY_STATE
} from '../../state';
import { DefaultValue } from 'recoil';
import { useEffect } from 'react';
import useThemeColors from '../../hooks/useThemeColors';
import * as l10n from '@vscode/l10n';
import { LocalizationKey } from '../../../localization';

export const guardRecoilDefaultValue = (candidate: any): candidate is DefaultValue => {
  if (candidate instanceof DefaultValue) return true;
  return false;
};

export interface IClearFiltersProps { }

export const ClearFilters: React.FunctionComponent<IClearFiltersProps> = (
  _: React.PropsWithChildren<IClearFiltersProps>
) => {
  const [show, setShow] = React.useState(false);
  const { getColors } = useThemeColors();

  const folder = useRecoilValue(FolderSelector);
  const tag = useRecoilValue(TagSelector);
  const category = useRecoilValue(CategorySelector);

  const resetSorting = useResetRecoilState(SortingAtom);
  const resetFolder = useResetRecoilState(FolderAtom);
  const resetTag = useResetRecoilState(TagAtom);
  const resetCategory = useResetRecoilState(CategoryAtom);

  const reset = () => {
    setShow(false);
    resetSorting();
    resetFolder();
    resetTag();
    resetCategory();
  };

  useEffect(() => {
    if (
      folder !== DEFAULT_FOLDER_STATE ||
      tag !== DEFAULT_TAG_STATE ||
      category !== DEFAULT_CATEGORY_STATE
    ) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [folder, tag, category]);

  if (!show) return null;

  return (
    <button
      className={`flex items-center ${getColors(
        'hover:text-teal-600',
        'hover:text-[var(--vscode-textLink-activeForeground)]'
      )
        }`}
      onClick={reset}
      title={l10n.t(LocalizationKey.dashboardHeaderClearFiltersTitle)}
    >
      <XCircleIcon className={`inline-block w-5 h-5 mr-1`} />
      <span>{l10n.t(LocalizationKey.commonClear)}</span>
    </button>
  );
};
