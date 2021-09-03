import { selector } from 'recoil';
import { TabAtom } from '..';

export const TabSelector = selector({
  key: 'TabSelector',
  get: ({get}) => {
    return get(TabAtom);
  }
});