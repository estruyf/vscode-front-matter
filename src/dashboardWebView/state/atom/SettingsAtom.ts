import { atom } from 'recoil';
import { Settings } from '../../models';

export const SettingsAtom = atom<Settings | null>({
  key: 'SettingsAtom',
  default: null
});