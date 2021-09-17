import { atom } from 'recoil';
import { Tab } from '../../constants/Tab';

export const TabAtom = atom<Tab>({
  key: 'TabAtom',
  default: Tab.All
});