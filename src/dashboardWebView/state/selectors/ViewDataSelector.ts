import { selector } from 'recoil';
import { ViewDataAtom } from '..';

export const ViewDataSelector = selector({
  key: 'ViewDataSelector',
  get: ({get}) => {
    return get(ViewDataAtom);
  }
});