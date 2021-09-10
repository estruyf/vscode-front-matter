import { atom } from 'recoil';

export const LightboxAtom = atom<string | null>({
  key: 'LightboxAtom',
  default: ""
});