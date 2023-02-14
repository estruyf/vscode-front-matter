import { atom } from 'recoil';

export const TabInfoAtom = atom<{ [tab: string]: number } | null>({
  key: 'TabInfoAtom',
  default: {}
});
