import { atom } from 'recoil';
import { NavigationType } from '../../models';

export const DashboardViewAtom = atom<NavigationType>({
  key: 'DashboardViewAtom',
  default: NavigationType.Contents
});