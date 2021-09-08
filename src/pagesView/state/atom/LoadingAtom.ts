import { atom } from 'recoil';

export const LoadingAtom = atom<boolean>({
  key: 'LoadingAtom',
  default: false
});