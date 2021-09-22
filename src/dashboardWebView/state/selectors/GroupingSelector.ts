import { selector } from 'recoil';
import { GroupingAtom } from '..';

export const GroupingSelector = selector({
  key: 'GroupingSelector',
  get: ({get}) => {
    return get(GroupingAtom);
  }
});