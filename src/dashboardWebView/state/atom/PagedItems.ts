import { atom } from 'recoil';

export const PagedItems = atom<string[]>({
  key: 'PagedItems',
  default: []
});
