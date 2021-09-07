import { atom } from 'recoil';

export const MediaFoldersAtom = atom<string[]>({
  key: 'MediaFoldersAtom',
  default: []
});