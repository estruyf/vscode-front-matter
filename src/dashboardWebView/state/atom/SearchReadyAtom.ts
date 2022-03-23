import { atom } from 'recoil';

export const SearchReadyAtom = atom<boolean>({
  key: 'SearchReadyAtom',
  default: false
});