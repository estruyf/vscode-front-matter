import { atom } from 'recoil';

export const DEFAULT_FOLDER_STATE = null;

export const FolderAtom = atom<string | null>({
  key: 'FolderAtom',
  default: DEFAULT_FOLDER_STATE
});