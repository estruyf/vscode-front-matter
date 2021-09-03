import { selector } from 'recoil';
import { TagAtom } from '..';

export const TagSelector = selector({
  key: 'TagSelector',
  get: ({get}) => {
    return get(TagAtom);
  }
});