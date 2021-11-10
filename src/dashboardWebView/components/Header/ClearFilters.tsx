import { XCircleIcon } from '@heroicons/react/solid';
import * as React from 'react';
import { useRecoilValue, useResetRecoilState } from 'recoil';
import { SortingSelector, FolderSelector, TagSelector, CategorySelector, SortingAtom, DEFAULT_SORTING_OPTION, FolderAtom, DEFAULT_FOLDER_STATE, TagAtom, CategoryAtom, DEFAULT_TAG_STATE, DEFAULT_CATEGORY_STATE } from '../../state';

import { DefaultValue } from 'recoil';

export const guardRecoilDefaultValue = (
  candidate: any
): candidate is DefaultValue => {
  if (candidate instanceof DefaultValue) return true;
  return false;
};

export interface IClearFiltersProps {}

export const ClearFilters: React.FunctionComponent<IClearFiltersProps> = (props: React.PropsWithChildren<IClearFiltersProps>) => {
  const [ show, setShow ] = React.useState(false);

  const sorting = useRecoilValue(SortingSelector);
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

  React.useEffect(() => {
    if (sorting.id !== DEFAULT_SORTING_OPTION || folder !== DEFAULT_FOLDER_STATE || tag !== DEFAULT_TAG_STATE || category !== DEFAULT_CATEGORY_STATE) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [sorting, folder, tag, category]);

  if (!show) return null;
  
  return (
    <button className="flex items-center hover:text-teal-600" onClick={reset} title={`Clear filters, grouping, and sorting`}>
      <XCircleIcon className={`inline-block w-5 h-5 mr-1`} /><span>Clear</span>
      <span className={`sr-only`}> filters, grouping, and sorting</span>
    </button>
  );
};