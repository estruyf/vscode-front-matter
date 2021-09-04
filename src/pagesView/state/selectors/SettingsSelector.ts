import { selector } from 'recoil';
import { SettingsAtom } from '..';

export const SettingsSelector = selector({
  key: 'SettingsSelector',
  get: ({get}) => {
    return get(SettingsAtom);
  }
});