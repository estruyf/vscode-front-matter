import { selector } from 'recoil';
import { ViewAtom } from '..';

export const ViewSelector = selector({
  key: 'ViewSelector',
  get: ({get}) => {
    return get(ViewAtom);
  }
});