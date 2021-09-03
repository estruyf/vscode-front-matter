import { atom } from 'recoil';

export const FolderAtom = atom<string | null>({
  key: 'FolderAtom',
  default: null
});