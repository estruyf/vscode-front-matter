import { selector } from 'recoil';
import { CategoryAtom } from '..';

export const CategorySelector = selector({
  key: 'CategorySelector',
  get: ({get}) => {
    return get(CategoryAtom);
  }
});