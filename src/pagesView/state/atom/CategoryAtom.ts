import { atom } from 'recoil';

export const CategoryAtom = atom<string | null>({
  key: 'CategoryAtom',
  default: ""
});