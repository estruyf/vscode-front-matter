import { atom } from 'recoil';
import { ViewType } from '../../models';

export const DashboardViewAtom = atom<ViewType>({
  key: 'DashboardViewAtom',
  default: ViewType.Contents
});