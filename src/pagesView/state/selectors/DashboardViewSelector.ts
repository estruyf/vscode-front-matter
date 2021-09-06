import { selector } from 'recoil';
import { DashboardViewAtom } from '..';

export const DashboardViewSelector = selector({
  key: 'DashboardViewSelector',
  get: ({get}) => {
    return get(DashboardViewAtom);
  }
});