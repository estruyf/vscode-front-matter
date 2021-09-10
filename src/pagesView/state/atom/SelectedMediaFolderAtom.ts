import { atom } from 'recoil';

export const SelectedMediaFolderAtom = atom<string | null>({
  key: 'SelectedMediaFolderAtom',
  default: null
});