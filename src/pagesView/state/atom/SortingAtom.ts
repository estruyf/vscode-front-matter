import { atom } from 'recoil';
import { SortOption } from '../../constants/SortOption';

export const DEFAULT_SORTING_OPTION = SortOption.LastModified;

export const SortingAtom = atom<SortOption>({
  key: 'SortingAtom',
  default: DEFAULT_SORTING_OPTION
});