import { atom } from 'recoil';

export const AllContentFoldersAtom = atom<string[] | undefined>({
  key: 'AllContentFoldersAtom',
  default: undefined
});
