import { atom } from 'recoil';

export const SelectedStructureFolderAtom = atom<string | null>({
  key: 'SelectedStructureFolderAtom',
  default: null
});
