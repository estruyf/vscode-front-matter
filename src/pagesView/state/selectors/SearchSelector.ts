import { selector } from 'recoil';
import { SearchAtom } from '..';

export const SearchSelector = selector({
  key: 'SearchSelector',
  get: ({get}) => {
    return get(SearchAtom);
  }
});