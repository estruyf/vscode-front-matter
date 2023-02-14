import { atom } from 'recoil';
import { DashboardViewType } from '../../models';

export const ViewAtom = atom<DashboardViewType>({
  key: 'ViewAtom',
  default: DashboardViewType.Grid
});
