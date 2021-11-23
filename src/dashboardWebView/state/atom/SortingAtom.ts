import { atom } from 'recoil';
import { SortOption } from '../../constants/SortOption';
import { SortingOption } from '../../models/SortingOption';

export const DEFAULT_SORTING_OPTION = SortOption.LastModifiedDesc;

export const SortingAtom = atom<SortingOption | null>({
  key: 'SortingAtom',
  default: null
});