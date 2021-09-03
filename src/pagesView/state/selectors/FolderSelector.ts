import { selector } from 'recoil';
import { FolderAtom } from '..';

export const FolderSelector = selector({
  key: 'FolderSelector',
  get: ({get}) => {
    return get(FolderAtom);
  }
});