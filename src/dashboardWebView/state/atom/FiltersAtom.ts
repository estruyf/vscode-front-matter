import { atom } from 'recoil';

export const FiltersAtom = atom<{ [filter: string]: string }>({
  key: 'FiltersAtom',
  default: {}
});
