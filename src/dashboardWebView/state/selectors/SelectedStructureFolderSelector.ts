import { selector } from 'recoil';
import { SelectedStructureFolderAtom } from '..';

export const SelectedStructureFolderSelector = selector({
  key: 'SelectedStructureFolderSelector',
  get: ({ get }) => {
    return get(SelectedStructureFolderAtom);
  }
});
