import { selector } from 'recoil';
import { MediaFoldersAtom } from '..';

export const MediaFoldersSelector = selector({
  key: 'MediaFoldersSelector',
  get: ({get}) => {
    return get(MediaFoldersAtom);
  }
});