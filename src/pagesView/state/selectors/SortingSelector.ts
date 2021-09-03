import { selector } from 'recoil';
import { SortingAtom } from '..';

export const SortingSelector = selector({
  key: 'SortingSelector',
  get: ({get}) => {
    return get(SortingAtom);
  }
});