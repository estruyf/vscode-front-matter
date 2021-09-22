import { atom } from 'recoil';
import { DashboardData } from '../../../models/DashboardData';

export const ViewDataAtom = atom<DashboardData | undefined>({
  key: 'ViewDataAtom',
  default: undefined
});