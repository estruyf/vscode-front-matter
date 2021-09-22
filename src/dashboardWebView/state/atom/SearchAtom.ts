import { atom } from 'recoil';

export const SearchAtom = atom<string>({
  key: 'SearchAtom',
  default: ""
});