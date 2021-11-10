import { atom } from 'recoil';
import { SortOrder, SortType } from '../../../models';
import { SortOption } from '../../constants/SortOption';

export const DEFAULT_SORTING_OPTION = SortOption.LastModified;

export const SortingAtom = atom<{ id: SortOption, name: string, order: SortOrder, type: SortType }>({
  key: 'SortingAtom',
  default: {
    id: DEFAULT_SORTING_OPTION,
    name: "",
    type: SortType.string,
    order: SortOrder.desc
  }
});