import { atom } from 'recoil';

export const AllStaticFoldersAtom = atom<string[] | undefined>({
  key: 'AllStaticFoldersAtom',
  default: undefined
});
