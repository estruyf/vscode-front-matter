import { atom } from 'recoil';

export const MultiSelectedItemsAtom = atom<string[]>({
  key: 'MultiSelectedItemsAtom',
  default: []
});
