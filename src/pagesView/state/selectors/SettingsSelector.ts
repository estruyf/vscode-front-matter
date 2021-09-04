import { selector } from 'recoil';
import { SettingsAtom } from '../atom/SettingsAtom';

export const SettingsSelector = selector({
  key: 'SettingsSelector',
  get: ({get}) => {
    return get(SettingsAtom);
  }
});