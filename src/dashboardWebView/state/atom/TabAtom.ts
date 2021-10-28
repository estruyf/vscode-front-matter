import { atom } from 'recoil';
import { Tab } from '../../constants/Tab';

export const TabAtom = atom<Tab | string>({
  key: 'TabAtom',
  default: Tab.All
});