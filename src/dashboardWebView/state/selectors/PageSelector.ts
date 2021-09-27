import { selector } from 'recoil';
import { PageAtom } from '..';

export const PageSelector = selector({
  key: 'PageSelector',
  get: ({get}) => {
    return get(PageAtom);
  }
});