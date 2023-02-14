import { atom } from 'recoil';
import { PanelSettings } from '../../../models';

export const PanelSettingsAtom = atom<PanelSettings | undefined>({
  key: 'PanelSettings',
  default: undefined
});
