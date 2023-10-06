import { atom } from 'recoil';

export const PinnedItemsAtom = atom<string[]>({
  key: 'PinnedItemsAtom',
  default: []
});
