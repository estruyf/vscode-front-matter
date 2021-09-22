import { selector } from 'recoil';
import { MediaTotalAtom } from '..';

export const MediaTotalSelector = selector({
  key: 'MediaTotalSelector',
  get: ({get}) => {
    return get(MediaTotalAtom);
  }
});