import { atom } from 'recoil';

export const PageAtom = atom<number>({
  key: 'PageAtom',
  default: 0
});