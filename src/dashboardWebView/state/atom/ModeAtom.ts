import { atom } from 'recoil';
import { Mode } from '../../../models';

export const ModeAtom = atom<Mode | undefined>({
  key: 'ModeAtom',
  default: undefined
});