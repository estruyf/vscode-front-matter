import { atom } from 'recoil';

export const TagAtom = atom<string | null>({
  key: 'TagAtom',
  default: ""
});