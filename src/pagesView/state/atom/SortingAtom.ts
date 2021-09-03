import { atom } from 'recoil';
import { SortOption } from '../../constants/SortOption';

export const SortingAtom = atom<SortOption>({
  key: 'SortingAtom',
  default: SortOption.LastModified
});