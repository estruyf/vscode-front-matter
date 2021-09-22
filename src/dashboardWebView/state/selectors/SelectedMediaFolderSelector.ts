import { selector } from 'recoil';
import { SelectedMediaFolderAtom } from '..';

export const SelectedMediaFolderSelector = selector({
  key: 'SelectedMediaFolderSelector',
  get: ({get}) => {
    return get(SelectedMediaFolderAtom);
  }
});