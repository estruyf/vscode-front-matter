import { selector } from 'recoil';
import { LoadingAtom } from '..';

export const LoadingSelector = selector({
  key: 'LoadingSelector',
  get: ({get}) => {
    return get(LoadingAtom);
  }
});